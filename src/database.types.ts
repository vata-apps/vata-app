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
      family_event_types: {
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
      family_events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          family_id: string
          id: string
          place_id: string | null
          type_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          family_id: string
          id?: string
          place_id?: string | null
          type_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          family_id?: string
          id?: string
          place_id?: string | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_sorting_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "family_event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_event_types: {
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
      individual_events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          individual_id: string
          place_id: string | null
          type_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          individual_id: string
          place_id?: string | null
          type_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          individual_id?: string
          place_id?: string | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_events_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "individuals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_events_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "individual_event_types"
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
      family_sorting_view: {
        Row: {
          created_at: string | null
          gedcom_id: number | null
          husband_first_name: string | null
          husband_gender: Database["public"]["Enums"]["gender"] | null
          husband_id: string | null
          husband_last_name: string | null
          id: string | null
          searchable_names: string | null
          type: Database["public"]["Enums"]["family_type"] | null
          wife_first_name: string | null
          wife_gender: Database["public"]["Enums"]["gender"] | null
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
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

