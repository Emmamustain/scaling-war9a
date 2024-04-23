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
      business_logs: {
        Row: {
          activity_description: string | null;
          business_id: string | null;
          created_at: string | null;
          log_id: string;
          timestamp: string | null;
          updated_at: string | null;
        };
        Insert: {
          activity_description?: string | null;
          business_id?: string | null;
          created_at?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activity_description?: string | null;
          business_id?: string | null;
          created_at?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "business_logs_business_id_businesses_business_id_fk";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["business_id"];
          },
        ];
      };
      businesses: {
        Row: {
          business_id: string;
          category_id: string;
          created_at: string;
          description: string;
          location: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          business_id?: string;
          category_id: string;
          created_at?: string;
          description: string;
          location: string;
          name: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          category_id?: string;
          created_at?: string;
          description?: string;
          location?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_categories_category_id_fk";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["category_id"];
          },
          {
            foreignKeyName: "businesses_owner_id_users_user_id_fk";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      categories: {
        Row: {
          category_id: string;
          created_at: string | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string;
          created_at?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string;
          created_at?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      guichet_logs: {
        Row: {
          activity_description: string | null;
          created_at: string | null;
          guichet_id: string | null;
          log_id: string;
          timestamp: string | null;
          updated_at: string | null;
        };
        Insert: {
          activity_description?: string | null;
          created_at?: string | null;
          guichet_id?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activity_description?: string | null;
          created_at?: string | null;
          guichet_id?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guichet_logs_guichet_id_guichets_guichet_id_fk";
            columns: ["guichet_id"];
            referencedRelation: "guichets";
            referencedColumns: ["guichet_id"];
          },
        ];
      };
      guichet_workers: {
        Row: {
          guichet_id: string | null;
          worker_id: string | null;
        };
        Insert: {
          guichet_id?: string | null;
          worker_id?: string | null;
        };
        Update: {
          guichet_id?: string | null;
          worker_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guichet_workers_guichet_id_guichets_guichet_id_fk";
            columns: ["guichet_id"];
            referencedRelation: "guichets";
            referencedColumns: ["guichet_id"];
          },
          {
            foreignKeyName: "guichet_workers_worker_id_workers_worker_id_fk";
            columns: ["worker_id"];
            referencedRelation: "workers";
            referencedColumns: ["worker_id"];
          },
        ];
      };
      guichets: {
        Row: {
          created_at: string;
          guichet_id: string;
          guichet_status: Database["public"]["Enums"]["guichet_status"] | null;
          name: string;
          queue_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          guichet_id?: string;
          guichet_status?: Database["public"]["Enums"]["guichet_status"] | null;
          name: string;
          queue_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          guichet_id?: string;
          guichet_status?: Database["public"]["Enums"]["guichet_status"] | null;
          name?: string;
          queue_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guichets_queue_id_queues_queue_id_fk";
            columns: ["queue_id"];
            referencedRelation: "queues";
            referencedColumns: ["queue_id"];
          },
        ];
      };
      queue_entries: {
        Row: {
          created_at: string;
          entry_id: string;
          entry_time: string;
          queue_id: string;
          status: Database["public"]["Enums"]["queue_entry_status"] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entry_id?: string;
          entry_time?: string;
          queue_id: string;
          status?: Database["public"]["Enums"]["queue_entry_status"] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string;
          entry_time?: string;
          queue_id?: string;
          status?: Database["public"]["Enums"]["queue_entry_status"] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queue_entries_queue_id_queues_queue_id_fk";
            columns: ["queue_id"];
            referencedRelation: "queues";
            referencedColumns: ["queue_id"];
          },
          {
            foreignKeyName: "queue_entries_user_id_users_user_id_fk";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      queue_logs: {
        Row: {
          activity_description: string | null;
          created_at: string | null;
          log_id: string;
          queue_id: string | null;
          timestamp: string | null;
          updated_at: string | null;
        };
        Insert: {
          activity_description?: string | null;
          created_at?: string | null;
          log_id?: string;
          queue_id?: string | null;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activity_description?: string | null;
          created_at?: string | null;
          log_id?: string;
          queue_id?: string | null;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "queue_logs_queue_id_queues_queue_id_fk";
            columns: ["queue_id"];
            referencedRelation: "queues";
            referencedColumns: ["queue_id"];
          },
        ];
      };
      queues: {
        Row: {
          ai_enabled: boolean | null;
          business_id: string;
          capacity: number;
          created_at: string;
          name: string;
          queue_id: string;
          updated_at: string;
        };
        Insert: {
          ai_enabled?: boolean | null;
          business_id: string;
          capacity?: number;
          created_at?: string;
          name: string;
          queue_id?: string;
          updated_at?: string;
        };
        Update: {
          ai_enabled?: boolean | null;
          business_id?: string;
          capacity?: number;
          created_at?: string;
          name?: string;
          queue_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queues_business_id_businesses_business_id_fk";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["business_id"];
          },
        ];
      };
      security_event_logs: {
        Row: {
          created_at: string | null;
          description: string | null;
          event_type: string | null;
          log_id: string;
          timestamp: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          event_type?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          event_type?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string | null;
          name: string | null;
          tag_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          name?: string | null;
          tag_id?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          name?: string | null;
          tag_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_businesses: {
        Row: {
          business_id: string | null;
          created_at: string | null;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          business_id?: string | null;
          created_at?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          business_id?: string | null;
          created_at?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_businesses_business_id_businesses_business_id_fk";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["business_id"];
          },
          {
            foreignKeyName: "user_businesses_user_id_users_user_id_fk";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_feedback: {
        Row: {
          created_at: string | null;
          feedback: string | null;
          feedback_id: string;
          timestamp: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          feedback?: string | null;
          feedback_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          feedback?: string | null;
          feedback_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_users_user_id_fk";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_logs: {
        Row: {
          activity_description: string | null;
          created_at: string | null;
          log_id: string;
          timestamp: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_description?: string | null;
          created_at?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_description?: string | null;
          created_at?: string | null;
          log_id?: string;
          timestamp?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_logs_user_id_users_user_id_fk";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          password_hash: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          password_hash: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          password_hash?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      workers: {
        Row: {
          business_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          user_id: string | null;
          worker_id: string;
        };
        Insert: {
          business_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          worker_id?: string;
        };
        Update: {
          business_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          worker_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workers_business_id_businesses_business_id_fk";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["business_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      guichet_status: "open" | "closed" | "paused";
      queue_entry_status: "waiting" | "closed" | "paused";
      user_role:
        | "regular"
        | "owner"
        | "manager"
        | "worker"
        | "super"
        | "admin"
        | "founder";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
