export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string;
          email_draft_model: string;
          research_model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_draft_model?: string;
          research_model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email_draft_model?: string;
          research_model?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          company_name: string | null;
          job_title: string | null;
          linkedin_url: string | null;
          website: string | null;
          location: string | null;
          context_notes: string | null;
          tags: string[];
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          location?: string | null;
          context_notes?: string | null;
          tags?: string[];
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          location?: string | null;
          context_notes?: string | null;
          tags?: string[];
          source?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      prospects: {
        Row: {
          id: string;
          company_name: string;
          division: string | null;
          region: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          division?: string | null;
          region?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          division?: string | null;
          region?: string | null;
          created_by?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      research_results: {
        Row: {
          id: string;
          prospect_id: string;
          source: string;
          raw_data: Json;
          summary: string | null;
          status: "pending" | "processing" | "completed" | "failed";
          refreshed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospect_id: string;
          source: string;
          raw_data?: Json;
          summary?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          refreshed_at?: string;
          created_at?: string;
        };
        Update: {
          source?: string;
          raw_data?: Json;
          summary?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          refreshed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_results_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Prospect = Database["public"]["Tables"]["prospects"]["Row"];
export type ProspectInsert = Database["public"]["Tables"]["prospects"]["Insert"];
export type ResearchResult = Database["public"]["Tables"]["research_results"]["Row"];

export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"];

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];
