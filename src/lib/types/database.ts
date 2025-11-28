export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      application_checklist: {
        Row: {
          application_id: string;
          due_date: string | null;
          id: string;
          status: Database['public']['Enums']['checklist_status'];
          task_name: string;
        };
        Insert: {
          application_id: string;
          due_date?: string | null;
          id?: string;
          status?: Database['public']['Enums']['checklist_status'];
          task_name: string;
        };
        Update: {
          application_id?: string;
          due_date?: string | null;
          id?: string;
          status?: Database['public']['Enums']['checklist_status'];
          task_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'application_checklist_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          }
        ];
      };
      application_tasks: {
        Row: {
          category: Database['public']['Enums']['application_task_category'];
          description: string | null;
          due_offset_days: number | null;
          id: string;
          name: string;
          program_id: string;
        };
        Insert: {
          category: Database['public']['Enums']['application_task_category'];
          description?: string | null;
          due_offset_days?: number | null;
          id?: string;
          name: string;
          program_id: string;
        };
        Update: {
          category?: Database['public']['Enums']['application_task_category'];
          description?: string | null;
          due_offset_days?: number | null;
          id?: string;
          name?: string;
          program_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'application_tasks_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          }
        ];
      };
      applications: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          portal_url: string | null;
          profile_id: string;
          program_id: string;
          status: Database['public']['Enums']['application_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          portal_url?: string | null;
          profile_id: string;
          program_id: string;
          status?: Database['public']['Enums']['application_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          portal_url?: string | null;
          profile_id?: string;
          program_id?: string;
          status?: Database['public']['Enums']['application_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          }
        ];
      };
      deadlines: {
        Row: {
          created_at: string;
          deadline_date: string | null;
          id: string;
          intake: string | null;
          is_rolling: boolean | null;
          name: string;
          program_id: string;
          source_id: string | null;
          timezone: string | null;
        };
        Insert: {
          created_at?: string;
          deadline_date?: string | null;
          id?: string;
          intake?: string | null;
          is_rolling?: boolean | null;
          name: string;
          program_id: string;
          source_id?: string | null;
          timezone?: string | null;
        };
        Update: {
          created_at?: string;
          deadline_date?: string | null;
          id?: string;
          intake?: string | null;
          is_rolling?: boolean | null;
          name?: string;
          program_id?: string;
          source_id?: string | null;
          timezone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'deadlines_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deadlines_source_id_fkey';
            columns: ['source_id'];
            isOneToOne: false;
            referencedRelation: 'sources';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          application_id: string;
          id: string;
          name: string;
          storage_path: string;
          type: string | null;
          uploaded_at: string;
        };
        Insert: {
          application_id: string;
          id?: string;
          name: string;
          storage_path: string;
          type?: string | null;
          uploaded_at?: string;
        };
        Update: {
          application_id?: string;
          id?: string;
          name?: string;
          storage_path?: string;
          type?: string | null;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          }
        ];
      };
      program_requirements: {
        Row: {
          curriculum: string | null;
          language_tests: Json | null;
          min_act: number | null;
          min_gpa: string | null;
          min_ib_total: number | null;
          min_sat: number | null;
          other_requirements: string | null;
          program_id: string;
          required_subjects: string[] | null;
        };
        Insert: {
          curriculum?: string | null;
          language_tests?: Json | null;
          min_act?: number | null;
          min_gpa?: string | null;
          min_ib_total?: number | null;
          min_sat?: number | null;
          other_requirements?: string | null;
          program_id: string;
          required_subjects?: string[] | null;
        };
        Update: {
          curriculum?: string | null;
          language_tests?: Json | null;
          min_act?: number | null;
          min_gpa?: string | null;
          min_ib_total?: number | null;
          min_sat?: number | null;
          other_requirements?: string | null;
          program_id?: string;
          required_subjects?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'program_requirements_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: true;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          }
        ];
      };
      programs: {
        Row: {
          created_at: string;
          currency: string | null;
          duration_years: string | null;
          field: string | null;
          id: string;
          intake_months: string[] | null;
          language: string | null;
          level: string | null;
          metadata: Json | null;
          mode: string | null;
          name: string;
          tuition: string | null;
          university_id: string;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          currency?: string | null;
          duration_years?: string | null;
          field?: string | null;
          id?: string;
          intake_months?: string[] | null;
          language?: string | null;
          level?: string | null;
          metadata?: Json | null;
          mode?: string | null;
          name: string;
          tuition?: string | null;
          university_id: string;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          currency?: string | null;
          duration_years?: string | null;
          field?: string | null;
          id?: string;
          intake_months?: string[] | null;
          language?: string | null;
          level?: string | null;
          metadata?: Json | null;
          mode?: string | null;
          name?: string;
          tuition?: string | null;
          university_id?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'programs_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          country: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          locale: string | null;
          role: string;
          time_zone: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          locale?: string | null;
          role?: string;
          time_zone?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          locale?: string | null;
          role?: string;
          time_zone?: string | null;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          health: Database['public']['Enums']['source_health'];
          id: string;
          last_scraped_at: string | null;
          name: string;
          notes: string | null;
          url: string | null;
        };
        Insert: {
          health?: Database['public']['Enums']['source_health'];
          id?: string;
          last_scraped_at?: string | null;
          name: string;
          notes?: string | null;
          url?: string | null;
        };
        Update: {
          health?: Database['public']['Enums']['source_health'];
          id?: string;
          last_scraped_at?: string | null;
          name?: string;
          notes?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      student_academics: {
        Row: {
          act: number | null;
          curriculum: string | null;
          gpa: string | null;
          ib_total: number | null;
          ielts: string | null;
          profile_id: string;
          sat: number | null;
          subject_grades: Json | null;
          toefl: number | null;
          updated_at: string;
        };
        Insert: {
          act?: number | null;
          curriculum?: string | null;
          gpa?: string | null;
          ib_total?: number | null;
          ielts?: string | null;
          profile_id: string;
          sat?: number | null;
          subject_grades?: Json | null;
          toefl?: number | null;
          updated_at?: string;
        };
        Update: {
          act?: number | null;
          curriculum?: string | null;
          gpa?: string | null;
          ib_total?: number | null;
          ielts?: string | null;
          profile_id?: string;
          sat?: number | null;
          subject_grades?: Json | null;
          toefl?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_academics_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      student_aspirations: {
        Row: {
          job_titles: string[] | null;
          notes: string | null;
          profile_id: string;
          target_fields: string[] | null;
          updated_at: string;
        };
        Insert: {
          job_titles?: string[] | null;
          notes?: string | null;
          profile_id: string;
          target_fields?: string[] | null;
          updated_at?: string;
        };
        Update: {
          job_titles?: string[] | null;
          notes?: string | null;
          profile_id?: string;
          target_fields?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_aspirations_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      student_matches: {
        Row: {
          breakdown: Json | null;
          created_at: string;
          id: string;
          profile_id: string;
          program_id: string;
          score: string | null;
        };
        Insert: {
          breakdown?: Json | null;
          created_at?: string;
          id?: string;
          profile_id: string;
          program_id: string;
          score?: string | null;
        };
        Update: {
          breakdown?: Json | null;
          created_at?: string;
          id?: string;
          profile_id?: string;
          program_id?: string;
          score?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_matches_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_matches_program_id_fkey';
            columns: ['program_id'];
            isOneToOne: false;
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          }
        ];
      };
      student_preferences: {
        Row: {
          aid_needed: boolean | null;
          budget_max: string | null;
          budget_min: string | null;
          campus_type: Database['public']['Enums']['campus_type'] | null;
          constraints: Json | null;
          countries: string[] | null;
          delivery: Database['public']['Enums']['delivery_type'] | null;
          languages: string[] | null;
          profile_id: string;
          program_levels: string[] | null;
          setting: Database['public']['Enums']['setting_type'] | null;
          size: Database['public']['Enums']['size_type'] | null;
          updated_at: string;
        };
        Insert: {
          aid_needed?: boolean | null;
          budget_max?: string | null;
          budget_min?: string | null;
          campus_type?: Database['public']['Enums']['campus_type'] | null;
          constraints?: Json | null;
          countries?: string[] | null;
          delivery?: Database['public']['Enums']['delivery_type'] | null;
          languages?: string[] | null;
          profile_id: string;
          program_levels?: string[] | null;
          setting?: Database['public']['Enums']['setting_type'] | null;
          size?: Database['public']['Enums']['size_type'] | null;
          updated_at?: string;
        };
        Update: {
          aid_needed?: boolean | null;
          budget_max?: string | null;
          budget_min?: string | null;
          campus_type?: Database['public']['Enums']['campus_type'] | null;
          constraints?: Json | null;
          countries?: string[] | null;
          delivery?: Database['public']['Enums']['delivery_type'] | null;
          languages?: string[] | null;
          profile_id?: string;
          program_levels?: string[] | null;
          setting?: Database['public']['Enums']['setting_type'] | null;
          size?: Database['public']['Enums']['size_type'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_preferences_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      universities: {
        Row: {
          acceptance_rate: string | null;
          city: string | null;
          country: string;
          created_at: string;
          currency: string | null;
          id: string;
          intl_tuition_high: string | null;
          intl_tuition_low: string | null;
          metadata: Json | null;
          name: string;
          rank_overall: number | null;
          rank_source: string | null;
          region: string | null;
          requires_test: boolean | null;
          website: string | null;
        };
        Insert: {
          acceptance_rate?: string | null;
          city?: string | null;
          country: string;
          created_at?: string;
          currency?: string | null;
          id?: string;
          intl_tuition_high?: string | null;
          intl_tuition_low?: string | null;
          metadata?: Json | null;
          name: string;
          rank_overall?: number | null;
          rank_source?: string | null;
          region?: string | null;
          requires_test?: boolean | null;
          website?: string | null;
        };
        Update: {
          acceptance_rate?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          currency?: string | null;
          id?: string;
          intl_tuition_high?: string | null;
          intl_tuition_low?: string | null;
          metadata?: Json | null;
          name?: string;
          rank_overall?: number | null;
          rank_source?: string | null;
          region?: string | null;
          requires_test?: boolean | null;
          website?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      application_status: 'planning' | 'in_progress' | 'submitted' | 'decision' | 'enrolled';
      application_task_category: 'test' | 'essay' | 'reference' | 'visa' | 'finance' | 'portal';
      campus_type: 'urban' | 'suburban' | 'rural' | 'online';
      checklist_status: 'todo' | 'doing' | 'done';
      delivery_type: 'in_person' | 'online' | 'hybrid';
      setting_type: 'public' | 'private' | 'international' | 'other';
      size_type: 'small' | 'medium' | 'large' | 'mega';
      source_health: 'ok' | 'stale' | 'error';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'objects_owner_fkey';
            columns: ['owner'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number | null;
          bucket_id: string | null;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix: string;
          delimiter: string;
          max_keys?: number;
          next_key_token?: string;
        };
        Returns: Json;
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix: string;
          delimiter: string;
          max_keys?: number;
          next_token?: string;
          start_after?: string;
        };
        Returns: Json;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
