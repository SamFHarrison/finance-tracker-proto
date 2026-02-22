


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_theme" AS ENUM (
    'system',
    'light',
    'dark'
);


ALTER TYPE "public"."app_theme" OWNER TO "postgres";


CREATE TYPE "public"."expense_category" AS ENUM (
    'essential',
    'debt',
    'luxuries',
    'variable',
    'savings_and_investments'
);


ALTER TYPE "public"."expense_category" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_period_start"("p_date" "date", "p_start_day" integer) RETURNS "date"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
declare
  month_first date;
  month_last date;
  candidate date;
  prev_month_first date;
  prev_month_last date;
  prev_candidate date;
  start_day int;
begin
  start_day := greatest(1, least(31, p_start_day));

  month_first := date_trunc('month', p_date)::date;
  month_last := (date_trunc('month', p_date)::date + interval '1 month - 1 day')::date;

  candidate := month_first + (least(start_day, extract(day from month_last)::int) - 1);

  if p_date >= candidate then
    return candidate;
  end if;

  prev_month_first := (month_first - interval '1 month')::date;
  prev_month_last := (month_first - interval '1 day')::date;
  prev_candidate := prev_month_first + (least(start_day, extract(day from prev_month_last)::int) - 1);

  return prev_candidate;
end $$;


ALTER FUNCTION "public"."compute_period_start"("p_date" "date", "p_start_day" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "period_start" "date" NOT NULL
);


ALTER TABLE "public"."budgets" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_budget"("p_date" "date" DEFAULT CURRENT_DATE) RETURNS "public"."budgets"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user uuid;
  v_start_day int;
  v_period_start date;
  v_budget public.budgets;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select month_start_day into v_start_day
  from public.profiles
  where user_id = v_user;

  if v_start_day is null then
    v_start_day := 1;
  end if;

  v_period_start := public.compute_period_start(p_date, v_start_day);

  insert into public.budgets (user_id, period_start)
  values (v_user, v_period_start)
  on conflict (user_id, period_start) do nothing;

  select * into v_budget
  from public.budgets
  where user_id = v_user and period_start = v_period_start;

  return v_budget;
end $$;


ALTER FUNCTION "public"."get_or_create_budget"("p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end $$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "amount_pence" bigint NOT NULL,
    "category" "public"."expense_category" NOT NULL,
    "payment_date" "date" NOT NULL,
    "is_paid" boolean DEFAULT false NOT NULL,
    CONSTRAINT "expenses_amount_pence_check" CHECK (("amount_pence" >= 0))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."income" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "amount_pence" bigint NOT NULL,
    "is_monthly" boolean DEFAULT false NOT NULL,
    CONSTRAINT "income_amount_pence_check" CHECK (("amount_pence" >= 0))
);


ALTER TABLE "public"."income" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."budget_summary" WITH ("security_invoker"='on') AS
 SELECT "id" AS "budget_id",
    "user_id",
    "period_start",
    COALESCE(( SELECT "sum"("i"."amount_pence") AS "sum"
           FROM "public"."income" "i"
          WHERE ("i"."budget_id" = "b"."id")), (0)::numeric) AS "income_total_pence",
    COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
           FROM "public"."expenses" "e"
          WHERE ("e"."budget_id" = "b"."id")), (0)::numeric) AS "expense_total_pence",
    COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."budget_id" = "b"."id") AND ("e"."is_paid" = false))), (0)::numeric) AS "still_to_pay_pence",
    COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = ANY (ARRAY['essential'::"public"."expense_category", 'debt'::"public"."expense_category"])))), (0)::numeric) AS "needs_pence",
    COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = ANY (ARRAY['luxuries'::"public"."expense_category", 'variable'::"public"."expense_category"])))), (0)::numeric) AS "wants_pence",
    COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
           FROM "public"."expenses" "e"
          WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = 'savings_and_investments'::"public"."expense_category"))), (0)::numeric) AS "savings_pence",
        CASE
            WHEN (COALESCE(( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id")), (0)::numeric) = (0)::numeric) THEN NULL::numeric
            ELSE "round"(((COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
               FROM "public"."expenses" "e"
              WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = ANY (ARRAY['essential'::"public"."expense_category", 'debt'::"public"."expense_category"])))), (0)::numeric) / ( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id"))) * (100)::numeric), 2)
        END AS "needs_pct_of_income",
        CASE
            WHEN (COALESCE(( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id")), (0)::numeric) = (0)::numeric) THEN NULL::numeric
            ELSE "round"(((COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
               FROM "public"."expenses" "e"
              WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = ANY (ARRAY['luxuries'::"public"."expense_category", 'variable'::"public"."expense_category"])))), (0)::numeric) / ( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id"))) * (100)::numeric), 2)
        END AS "wants_pct_of_income",
        CASE
            WHEN (COALESCE(( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id")), (0)::numeric) = (0)::numeric) THEN NULL::numeric
            ELSE "round"(((COALESCE(( SELECT "sum"("e"."amount_pence") AS "sum"
               FROM "public"."expenses" "e"
              WHERE (("e"."budget_id" = "b"."id") AND ("e"."category" = 'savings_and_investments'::"public"."expense_category"))), (0)::numeric) / ( SELECT "sum"("i"."amount_pence") AS "sum"
               FROM "public"."income" "i"
              WHERE ("i"."budget_id" = "b"."id"))) * (100)::numeric), 2)
        END AS "savings_pct_of_income"
   FROM "public"."budgets" "b";


ALTER VIEW "public"."budget_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "preferred_currency" "text" DEFAULT 'GBP'::"text" NOT NULL,
    "month_start_day" smallint DEFAULT 1 NOT NULL,
    "preferred_app_theme" "public"."app_theme" DEFAULT 'system'::"public"."app_theme" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_month_start_day_check" CHECK ((("month_start_day" >= 1) AND ("month_start_day" <= 31))),
    CONSTRAINT "profiles_preferred_currency_check" CHECK (("preferred_currency" = 'GBP'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_user_period_unique" UNIQUE ("user_id", "period_start");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "budgets_user_period_idx" ON "public"."budgets" USING "btree" ("user_id", "period_start");



CREATE INDEX "expenses_budget_category_idx" ON "public"."expenses" USING "btree" ("budget_id", "category");



CREATE INDEX "expenses_budget_is_paid_idx" ON "public"."expenses" USING "btree" ("budget_id", "is_paid");



CREATE INDEX "expenses_budget_payment_idx" ON "public"."expenses" USING "btree" ("budget_id", "payment_date");



CREATE INDEX "income_budget_idx" ON "public"."income" USING "btree" ("budget_id");



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."income"
    ADD CONSTRAINT "income_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "budgets_crud_own" ON "public"."budgets" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expenses_crud_via_budget" ON "public"."expenses" USING ((EXISTS ( SELECT 1
   FROM "public"."budgets" "b"
  WHERE (("b"."id" = "expenses"."budget_id") AND ("b"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."budgets" "b"
  WHERE (("b"."id" = "expenses"."budget_id") AND ("b"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."income" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "income_crud_via_budget" ON "public"."income" USING ((EXISTS ( SELECT 1
   FROM "public"."budgets" "b"
  WHERE (("b"."id" = "income"."budget_id") AND ("b"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."budgets" "b"
  WHERE (("b"."id" = "income"."budget_id") AND ("b"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."compute_period_start"("p_date" "date", "p_start_day" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."compute_period_start"("p_date" "date", "p_start_day" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compute_period_start"("p_date" "date", "p_start_day" integer) TO "service_role";



GRANT ALL ON TABLE "public"."budgets" TO "anon";
GRANT ALL ON TABLE "public"."budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."budgets" TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_or_create_budget"("p_date" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_or_create_budget"("p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_budget"("p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_budget"("p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."income" TO "anon";
GRANT ALL ON TABLE "public"."income" TO "authenticated";
GRANT ALL ON TABLE "public"."income" TO "service_role";



GRANT ALL ON TABLE "public"."budget_summary" TO "anon";
GRANT ALL ON TABLE "public"."budget_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."budget_summary" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


