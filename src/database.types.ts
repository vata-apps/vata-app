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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          individual_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          individual_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          individual_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_roles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_subjects: {
        Row: {
          created_at: string
          event_id: string
          id: string
          individual_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          individual_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          individual_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_subjects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_subjects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_subjects_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          place_id: string | null
          type_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          place_id?: string | null
          type_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          place_id?: string | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          gedcom_id: number
          husband_id: string | null
          id: string
          type: Database["public"]["Enums"]["family_type"]
          wife_id: string | null
        }
        Insert: {
          created_at?: string
          gedcom_id?: number
          husband_id?: string | null
          id?: string
          type?: Database["public"]["Enums"]["family_type"]
          wife_id?: string | null
        }
        Update: {
          created_at?: string
          gedcom_id?: number
          husband_id?: string | null
          id?: string
          type?: Database["public"]["Enums"]["family_type"]
          wife_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_husband_id_fkey"
            columns: ["husband_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_wife_id_fkey"
            columns: ["wife_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      family_children: {
        Row: {
          created_at: string
          family_id: string
          id: string
          individual_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          individual_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          individual_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_sorting_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_children_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      individuals: {
        Row: {
          created_at: string
          gedcom_id: number
          gender: Database["public"]["Enums"]["gender"]
          id: string
        }
        Insert: {
          created_at?: string
          gedcom_id?: number
          gender: Database["public"]["Enums"]["gender"]
          id?: string
        }
        Update: {
          created_at?: string
          gedcom_id?: number
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
        }
        Relationships: []
      }
      names: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          individual_id: string
          is_primary: boolean
          last_name: string | null
          surname: string | null
          type: Database["public"]["Enums"]["name_type"]
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          individual_id: string
          is_primary?: boolean
          last_name?: string | null
          surname?: string | null
          type?: Database["public"]["Enums"]["name_type"]
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          individual_id?: string
          is_primary?: boolean
          last_name?: string | null
          surname?: string | null
          type?: Database["public"]["Enums"]["name_type"]
        }
        Relationships: [
          {
            foreignKeyName: "names_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      place_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          parent_id: string | null
          type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          parent_id?: string | null
          type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          parent_id?: string | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "place_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      event_details: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          event_category: string | null
          event_type_name: string | null
          id: string | null
          place_id: string | null
          place_name: string | null
          subjects: Json | null
          type_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      family_sorting_view: {
        Row: {
          created_at: string | null
          gedcom_id: number | null
          husband_first_name: string | null
          husband_id: string | null
          husband_last_name: string | null
          id: string | null
          searchable_names: string | null
          type: Database["public"]["Enums"]["family_type"] | null
          wife_first_name: string | null
          wife_id: string | null
          wife_last_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_husband_id_fkey"
            columns: ["husband_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_wife_id_fkey"
            columns: ["wife_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_event_id: {
        Args: { event_name: string }
        Returns: string
      }
      get_event_participants: {
        Args: { event_id: string }
        Returns: Json
      }
      get_event_role_id: {
        Args: { role_name: string }
        Returns: string
      }
      get_event_type_id: {
        Args: { event_type_name: string }
        Returns: string
      }
      get_events_with_subjects: {
        Args: {
          search_text?: string
          page_number?: number
          sort_field?: string
          sort_direction?: string
        }
        Returns: {
          id: string
          date: string
          description: string
          event_type_name: string
          place_name: string
          subjects: string
        }[]
      }
    }
    Enums: {
      family_type: "married" | "civil union" | "unknown" | "unmarried"
      gender: "male" | "female"
      name_type: "birth" | "marriage" | "nickname" | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      family_type: ["married", "civil union", "unknown", "unmarried"],
      gender: ["male", "female"],
      name_type: ["birth", "marriage", "nickname", "unknown"],
    },
  },
} as const

