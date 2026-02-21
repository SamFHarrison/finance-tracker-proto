"use client";

import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  H2,
  Input,
  P,
} from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const supabase = createClient();

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setErr(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setErr(error.message);
    router.push(next);
  }

  return (
    <div className="flex flex-col gap-6 px-4 h-full pt-40">
      <div>
        <P isSubtext>Welcome to</P>
        <H2>FinanceTracker</H2>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </Field>

          <Field>
            <Button type="submit">Log in</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
