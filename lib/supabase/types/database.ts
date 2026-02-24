export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          created_at: string
          id: string
          period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_pence: number
          budget_id: string
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          id: string
          is_paid: boolean
          name: string
          payment_date: string
        }
        Insert: {
          amount_pence: number
          budget_id: string
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          id?: string
          is_paid?: boolean
          name: string
          payment_date: string
        }
        Update: {
          amount_pence?: number
          budget_id?: string
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          id?: string
          is_paid?: boolean
          name?: string
          payment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["budget_id"]
          },
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount_pence: number
          budget_id: string
          created_at: string
          id: string
          is_monthly: boolean
          name: string
        }
        Insert: {
          amount_pence: number
          budget_id: string
          created_at?: string
          id?: string
          is_monthly?: boolean
          name: string
        }
        Update: {
          amount_pence?: number
          budget_id?: string
          created_at?: string
          id?: string
          is_monthly?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["budget_id"]
          },
          {
            foreignKeyName: "income_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_period_start: string | null
          display_name: string | null
          month_start_day: number
          next_month_start_day: number | null
          preferred_app_theme: Database["public"]["Enums"]["app_theme"]
          preferred_currency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_start?: string | null
          display_name?: string | null
          month_start_day?: number
          next_month_start_day?: number | null
          preferred_app_theme?: Database["public"]["Enums"]["app_theme"]
          preferred_currency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_start?: string | null
          display_name?: string | null
          month_start_day?: number
          next_month_start_day?: number | null
          preferred_app_theme?: Database["public"]["Enums"]["app_theme"]
          preferred_currency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      budget_summary: {
        Row: {
          budget_id: string | null
          expense_total_pence: number | null
          income_total_pence: number | null
          needs_pct_of_income: number | null
          needs_pence: number | null
          period_start: string | null
          savings_pct_of_income: number | null
          savings_pence: number | null
          still_to_pay_pence: number | null
          user_id: string | null
          wants_pct_of_income: number | null
          wants_pence: number | null
        }
        Insert: {
          budget_id?: string | null
          expense_total_pence?: never
          income_total_pence?: never
          needs_pct_of_income?: never
          needs_pence?: never
          period_start?: string | null
          savings_pct_of_income?: never
          savings_pence?: never
          still_to_pay_pence?: never
          user_id?: string | null
          wants_pct_of_income?: never
          wants_pence?: never
        }
        Update: {
          budget_id?: string | null
          expense_total_pence?: never
          income_total_pence?: never
          needs_pct_of_income?: never
          needs_pence?: never
          period_start?: string | null
          savings_pct_of_income?: never
          savings_pence?: never
          still_to_pay_pence?: never
          user_id?: string | null
          wants_pct_of_income?: never
          wants_pence?: never
        }
        Relationships: []
      }
    }
    Functions: {
      compute_period_start: {
        Args: { p_date: string; p_start_day: number }
        Returns: string
      }
      get_or_create_budget: {
        Args: { p_date?: string }
        Returns: {
          created_at: string
          id: string
          period_start: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "budgets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_month_start_day_next_cycle: {
        Args: { p_new_start_day: number }
        Returns: {
          created_at: string
          current_period_start: string | null
          display_name: string | null
          month_start_day: number
          next_month_start_day: number | null
          preferred_app_theme: Database["public"]["Enums"]["app_theme"]
          preferred_currency: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_theme: "system" | "light" | "dark"
      expense_category:
        | "essential"
        | "debt"
        | "luxuries"
        | "variable"
        | "savings_and_investments"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_theme: ["system", "light", "dark"],
      expense_category: [
        "essential",
        "debt",
        "luxuries",
        "variable",
        "savings_and_investments",
      ],
    },
  },
} as const

