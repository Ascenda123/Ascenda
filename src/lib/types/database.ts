export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_checklist: {
        Row: {
          application_id: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["checklist_status"]
          task_name: string
        }
        Insert: {
          application_id: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["checklist_status"]
          task_name: string
        }
        Update: {
          application_id?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["checklist_status"]
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_checklist_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_tasks: {
        Row: {
          category: Database["public"]["Enums"]["application_task_category"]
          description: string | null
          due_offset_days: number | null
          id: string
          name: string
          program_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["application_task_category"]
          description?: string | null
          due_offset_days?: number | null
          id?: string
          name: string
          program_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["application_task_category"]
          description?: string | null
          due_offset_days?: number | null
          id?: string
          name?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          portal_url: string | null
          profile_id: string
          program_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          portal_url?: string | null
          profile_id: string
          program_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          portal_url?: string | null
          profile_id?: string
          program_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          created_at: string
          deadline_date: string | null
          id: string
          intake: string | null
          is_rolling: boolean | null
          name: string
          program_id: string
          source_id: string | null
          timezone: string | null
        }
        Insert: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          intake?: string | null
          is_rolling?: boolean | null
          name: string
          program_id: string
          source_id?: string | null
          timezone?: string | null
        }
        Update: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          intake?: string | null
          is_rolling?: boolean | null
          name?: string
          program_id?: string
          source_id?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          application_id: string
          id: string
          name: string
          storage_path: string
          type: string | null
          uploaded_at: string
        }
        Insert: {
          application_id: string
          id?: string
          name: string
          storage_path: string
          type?: string | null
          uploaded_at?: string
        }
        Update: {
          application_id?: string
          id?: string
          name?: string
          storage_path?: string
          type?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string | null
          role: string
          time_zone: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          role?: string
          time_zone?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          role?: string
          time_zone?: string | null
        }
        Relationships: []
      }
      program_requirements: {
        Row: {
          curriculum: string | null
          language_tests: Json | null
          min_act: number | null
          min_gpa: number | null
          min_ib_total: number | null
          min_sat: number | null
          other_requirements: string | null
          program_id: string
          required_subjects: string[] | null
        }
        Insert: {
          curriculum?: string | null
          language_tests?: Json | null
          min_act?: number | null
          min_gpa?: number | null
          min_ib_total?: number | null
          min_sat?: number | null
          other_requirements?: string | null
          program_id: string
          required_subjects?: string[] | null
        }
        Update: {
          curriculum?: string | null
          language_tests?: Json | null
          min_act?: number | null
          min_gpa?: number | null
          min_ib_total?: number | null
          min_sat?: number | null
          other_requirements?: string | null
          program_id?: string
          required_subjects?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "program_requirements_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          additional_entry_requirements: string | null
          additional_fee_info: string | null
          assessment_methods: string | null
          average_salary_after_15m: string | null
          campus: string | null
          contextual_admissions: string | null
          course_name: string
          course_summary: string | null
          created_at: string
          currency: string | null
          duration: string | null
          duration_years: number | null
          employment_after_course: string | null
          english_requirements: string | null
          entry_requirements_overview: string | null
          field: string | null
          historic_entry_grades: string | null
          id: string
          intake_months: string[] | null
          language: string | null
          level: string | null
          metadata: Json | null
          min_alevel: string | null
          min_ib: string | null
          mode: string | null
          modules: string | null
          name: string | null
          open_days: string | null
          provider_apply_url: string | null
          provider_course_url: string | null
          start_date: string | null
          student_outcomes: string | null
          student_satisfaction: string | null
          study_level: string | null
          subject_requirements: string | null
          subsequent_year_entry_requirements: string | null
          tuition: number | null
          tuition_fees_home: string | null
          tuition_fees_international: string | null
          ucas_code: string | null
          ucas_points: string | null
          university_id: string
          url: string | null
        }
        Insert: {
          additional_entry_requirements?: string | null
          additional_fee_info?: string | null
          assessment_methods?: string | null
          average_salary_after_15m?: string | null
          campus?: string | null
          contextual_admissions?: string | null
          course_name: string
          course_summary?: string | null
          created_at?: string
          currency?: string | null
          duration?: string | null
          duration_years?: number | null
          employment_after_course?: string | null
          english_requirements?: string | null
          entry_requirements_overview?: string | null
          field?: string | null
          historic_entry_grades?: string | null
          id?: string
          intake_months?: string[] | null
          language?: string | null
          level?: string | null
          metadata?: Json | null
          min_alevel?: string | null
          min_ib?: string | null
          mode?: string | null
          modules?: string | null
          name?: string | null
          open_days?: string | null
          provider_apply_url?: string | null
          provider_course_url?: string | null
          start_date?: string | null
          student_outcomes?: string | null
          student_satisfaction?: string | null
          study_level?: string | null
          subject_requirements?: string | null
          subsequent_year_entry_requirements?: string | null
          tuition?: number | null
          tuition_fees_home?: string | null
          tuition_fees_international?: string | null
          ucas_code?: string | null
          ucas_points?: string | null
          university_id: string
          url?: string | null
        }
        Update: {
          additional_entry_requirements?: string | null
          additional_fee_info?: string | null
          assessment_methods?: string | null
          average_salary_after_15m?: string | null
          campus?: string | null
          contextual_admissions?: string | null
          course_name?: string
          course_summary?: string | null
          created_at?: string
          currency?: string | null
          duration?: string | null
          duration_years?: number | null
          employment_after_course?: string | null
          english_requirements?: string | null
          entry_requirements_overview?: string | null
          field?: string | null
          historic_entry_grades?: string | null
          id?: string
          intake_months?: string[] | null
          language?: string | null
          level?: string | null
          metadata?: Json | null
          min_alevel?: string | null
          min_ib?: string | null
          mode?: string | null
          modules?: string | null
          name?: string | null
          open_days?: string | null
          provider_apply_url?: string | null
          provider_course_url?: string | null
          start_date?: string | null
          student_outcomes?: string | null
          student_satisfaction?: string | null
          study_level?: string | null
          subject_requirements?: string | null
          subsequent_year_entry_requirements?: string | null
          tuition?: number | null
          tuition_fees_home?: string | null
          tuition_fees_international?: string | null
          ucas_code?: string | null
          ucas_points?: string | null
          university_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          health: Database["public"]["Enums"]["source_health"]
          id: string
          last_scraped_at: string | null
          name: string
          notes: string | null
          url: string | null
        }
        Insert: {
          health?: Database["public"]["Enums"]["source_health"]
          id?: string
          last_scraped_at?: string | null
          name: string
          notes?: string | null
          url?: string | null
        }
        Update: {
          health?: Database["public"]["Enums"]["source_health"]
          id?: string
          last_scraped_at?: string | null
          name?: string
          notes?: string | null
          url?: string | null
        }
        Relationships: []
      }
      student_academic_input: {
        Row: {
          a_level_predicted_grades: Json | null
          career_aspiration: string | null
          desired_start_date: string | null
          ee_subject: string | null
          ee_summary: string | null
          ee_title: string | null
          english_required: boolean | null
          english_score_overall: number | null
          english_status: Database["public"]["Enums"]["english_status"] | null
          english_test_type:
            | Database["public"]["Enums"]["english_test_type"]
            | null
          graduation_year: number | null
          ib_core_points: number | null
          ib_ee_grade: Database["public"]["Enums"]["ib_grade"] | null
          ib_math_pathway: Database["public"]["Enums"]["ib_math_pathway"] | null
          ib_tok_grade: Database["public"]["Enums"]["ib_grade"] | null
          ib_total_points: number | null
          intended_clusters:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          language_of_instruction:
            | Database["public"]["Enums"]["language_of_instruction"]
            | null
          profile_id: string
          programme_type: Database["public"]["Enums"]["programme_type"] | null
          school_city: string | null
          school_country: string | null
          school_name: string | null
          school_type: Database["public"]["Enums"]["school_type"] | null
          secondary_clusters:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          updated_at: string
        }
        Insert: {
          a_level_predicted_grades?: Json | null
          career_aspiration?: string | null
          desired_start_date?: string | null
          ee_subject?: string | null
          ee_summary?: string | null
          ee_title?: string | null
          english_required?: boolean | null
          english_score_overall?: number | null
          english_status?: Database["public"]["Enums"]["english_status"] | null
          english_test_type?:
            | Database["public"]["Enums"]["english_test_type"]
            | null
          graduation_year?: number | null
          ib_core_points?: number | null
          ib_ee_grade?: Database["public"]["Enums"]["ib_grade"] | null
          ib_math_pathway?:
            | Database["public"]["Enums"]["ib_math_pathway"]
            | null
          ib_tok_grade?: Database["public"]["Enums"]["ib_grade"] | null
          ib_total_points?: number | null
          intended_clusters?:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          language_of_instruction?:
            | Database["public"]["Enums"]["language_of_instruction"]
            | null
          profile_id: string
          programme_type?: Database["public"]["Enums"]["programme_type"] | null
          school_city?: string | null
          school_country?: string | null
          school_name?: string | null
          school_type?: Database["public"]["Enums"]["school_type"] | null
          secondary_clusters?:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          updated_at?: string
        }
        Update: {
          a_level_predicted_grades?: Json | null
          career_aspiration?: string | null
          desired_start_date?: string | null
          ee_subject?: string | null
          ee_summary?: string | null
          ee_title?: string | null
          english_required?: boolean | null
          english_score_overall?: number | null
          english_status?: Database["public"]["Enums"]["english_status"] | null
          english_test_type?:
            | Database["public"]["Enums"]["english_test_type"]
            | null
          graduation_year?: number | null
          ib_core_points?: number | null
          ib_ee_grade?: Database["public"]["Enums"]["ib_grade"] | null
          ib_math_pathway?:
            | Database["public"]["Enums"]["ib_math_pathway"]
            | null
          ib_tok_grade?: Database["public"]["Enums"]["ib_grade"] | null
          ib_total_points?: number | null
          intended_clusters?:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          language_of_instruction?:
            | Database["public"]["Enums"]["language_of_instruction"]
            | null
          profile_id?: string
          programme_type?: Database["public"]["Enums"]["programme_type"] | null
          school_city?: string | null
          school_country?: string | null
          school_name?: string | null
          school_type?: Database["public"]["Enums"]["school_type"] | null
          secondary_clusters?:
            | Database["public"]["Enums"]["intended_cluster"][]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academic_input_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_admissions_tests: {
        Row: {
          created_at: string
          id: string
          percentile: number | null
          profile_id: string
          score_numeric: number | null
          status: Database["public"]["Enums"]["admissions_status"] | null
          test_type: Database["public"]["Enums"]["admissions_test_type"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          percentile?: number | null
          profile_id: string
          score_numeric?: number | null
          status?: Database["public"]["Enums"]["admissions_status"] | null
          test_type?: Database["public"]["Enums"]["admissions_test_type"] | null
        }
        Update: {
          created_at?: string
          id?: string
          percentile?: number | null
          profile_id?: string
          score_numeric?: number | null
          status?: Database["public"]["Enums"]["admissions_status"] | null
          test_type?: Database["public"]["Enums"]["admissions_test_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "student_admissions_tests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_lifestyle_preference: {
        Row: {
          campus_size:
            | Database["public"]["Enums"]["campus_size_preference"]
            | null
          desired_location_type:
            | Database["public"]["Enums"]["location_type"]
            | null
          extracurricular_interests: string[] | null
          other_extracurriculars: string | null
          profile_id: string
          teaching_style: Database["public"]["Enums"]["teaching_style"] | null
          updated_at: string
        }
        Insert: {
          campus_size?:
            | Database["public"]["Enums"]["campus_size_preference"]
            | null
          desired_location_type?:
            | Database["public"]["Enums"]["location_type"]
            | null
          extracurricular_interests?: string[] | null
          other_extracurriculars?: string | null
          profile_id: string
          teaching_style?: Database["public"]["Enums"]["teaching_style"] | null
          updated_at?: string
        }
        Update: {
          campus_size?:
            | Database["public"]["Enums"]["campus_size_preference"]
            | null
          desired_location_type?:
            | Database["public"]["Enums"]["location_type"]
            | null
          extracurricular_interests?: string[] | null
          other_extracurriculars?: string | null
          profile_id?: string
          teaching_style?: Database["public"]["Enums"]["teaching_style"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_lifestyle_preference_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_matches: {
        Row: {
          breakdown: Json | null
          created_at: string
          id: string
          profile_id: string
          program_id: string
          score: number | null
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          profile_id: string
          program_id: string
          score?: number | null
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          profile_id?: string
          program_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_matches_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_personal_information: {
        Row: {
          age: number | null
          current_location_city: string | null
          email: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          last_name: string | null
          nationality: string | null
          phone: string | null
          profile_id: string
          resident_country: string | null
          time_zone: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          current_location_city?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          profile_id: string
          resident_country?: string | null
          time_zone?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          current_location_city?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          profile_id?: string
          resident_country?: string | null
          time_zone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_personal_information_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          breakdown: Json | null
          eligibility_flags: string[] | null
          profile_id: string
          readiness_flags: string[] | null
          student_band: string | null
          total_score: number | null
          updated_at: string
        }
        Insert: {
          breakdown?: Json | null
          eligibility_flags?: string[] | null
          profile_id: string
          readiness_flags?: string[] | null
          student_band?: string | null
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          breakdown?: Json | null
          eligibility_flags?: string[] | null
          profile_id?: string
          readiness_flags?: string[] | null
          student_band?: string | null
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subjects: {
        Row: {
          created_at: string
          grade_value: string | null
          id: string
          level: Database["public"]["Enums"]["subject_level"] | null
          profile_id: string
          subject_name: string | null
        }
        Insert: {
          created_at?: string
          grade_value?: string | null
          id?: string
          level?: Database["public"]["Enums"]["subject_level"] | null
          profile_id: string
          subject_name?: string | null
        }
        Update: {
          created_at?: string
          grade_value?: string | null
          id?: string
          level?: Database["public"]["Enums"]["subject_level"] | null
          profile_id?: string
          subject_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_subjects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          acceptance_rate: number | null
          city: string | null
          country: string
          created_at: string
          currency: string | null
          id: string
          intl_tuition_high: number | null
          intl_tuition_low: number | null
          metadata: Json | null
          name: string
          rank_overall: number | null
          rank_source: string | null
          region: string | null
          requires_test: boolean | null
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          city?: string | null
          country: string
          created_at?: string
          currency?: string | null
          id?: string
          intl_tuition_high?: number | null
          intl_tuition_low?: number | null
          metadata?: Json | null
          name: string
          rank_overall?: number | null
          rank_source?: string | null
          region?: string | null
          requires_test?: boolean | null
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string | null
          id?: string
          intl_tuition_high?: number | null
          intl_tuition_low?: number | null
          metadata?: Json | null
          name?: string
          rank_overall?: number | null
          rank_source?: string | null
          region?: string | null
          requires_test?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      admissions_status: "taken" | "booked" | "missing"
      admissions_test_type:
        | "LNAT"
        | "UCAT"
        | "TMUA"
        | "MAT"
        | "STEP"
        | "ESAT"
        | "TSA"
        | "NONE"
      application_status:
        | "planning"
        | "in_progress"
        | "submitted"
        | "decision"
        | "enrolled"
      application_task_category:
        | "test"
        | "essay"
        | "reference"
        | "visa"
        | "finance"
        | "portal"
      campus_size_preference: "small" | "medium" | "large" | "no_preference"
      campus_type: "urban" | "suburban" | "rural" | "online"
      checklist_status: "todo" | "doing" | "done"
      delivery_type: "in_person" | "online" | "hybrid"
      english_status:
        | "met"
        | "exceeds"
        | "exceptional"
        | "booked"
        | "missing"
        | "failed"
      english_test_type: "IELTS" | "TOEFL" | "DUOLINGO" | "WAIVER" | "NONE"
      gender_type: "female" | "male" | "non_binary" | "prefer_not_to_say"
      ib_grade: "A" | "B" | "C" | "D" | "E"
      ib_math_pathway: "AA_HL" | "AA_SL" | "AI_HL" | "AI_SL"
      intended_cluster:
        | "computer_science"
        | "maths"
        | "engineering"
        | "life_sciences_biochem"
        | "medicine_dentistry"
        | "economics_quant"
        | "business_non_quant"
        | "law"
        | "humanities"
        | "creative"
      language_of_instruction: "english" | "bilingual" | "non_english"
      location_type:
        | "london"
        | "major_city"
        | "smaller_city"
        | "suburban"
        | "no_preference"
      programme_type: "IB" | "A_LEVEL"
      school_type:
        | "international_school"
        | "local_private"
        | "state_public"
        | "boarding"
        | "other"
      setting_type: "public" | "private" | "international" | "other"
      size_type: "small" | "medium" | "large" | "mega"
      source_health: "ok" | "stale" | "error"
      subject_level: "HL" | "SL" | "A_LEVEL"
      teaching_style: "academic" | "practical" | "mixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  public: {
    Enums: {
      admissions_status: ["taken", "booked", "missing"],
      admissions_test_type: [
        "LNAT",
        "UCAT",
        "TMUA",
        "MAT",
        "STEP",
        "ESAT",
        "TSA",
        "NONE",
      ],
      application_status: [
        "planning",
        "in_progress",
        "submitted",
        "decision",
        "enrolled",
      ],
      application_task_category: [
        "test",
        "essay",
        "reference",
        "visa",
        "finance",
        "portal",
      ],
      campus_size_preference: ["small", "medium", "large", "no_preference"],
      campus_type: ["urban", "suburban", "rural", "online"],
      checklist_status: ["todo", "doing", "done"],
      delivery_type: ["in_person", "online", "hybrid"],
      english_status: [
        "met",
        "exceeds",
        "exceptional",
        "booked",
        "missing",
        "failed",
      ],
      english_test_type: ["IELTS", "TOEFL", "DUOLINGO", "WAIVER", "NONE"],
      gender_type: ["female", "male", "non_binary", "prefer_not_to_say"],
      ib_grade: ["A", "B", "C", "D", "E"],
      ib_math_pathway: ["AA_HL", "AA_SL", "AI_HL", "AI_SL"],
      intended_cluster: [
        "computer_science",
        "maths",
        "engineering",
        "life_sciences_biochem",
        "medicine_dentistry",
        "economics_quant",
        "business_non_quant",
        "law",
        "humanities",
        "creative",
      ],
      language_of_instruction: ["english", "bilingual", "non_english"],
      location_type: [
        "london",
        "major_city",
        "smaller_city",
        "suburban",
        "no_preference",
      ],
      programme_type: ["IB", "A_LEVEL"],
      school_type: [
        "international_school",
        "local_private",
        "state_public",
        "boarding",
        "other",
      ],
      setting_type: ["public", "private", "international", "other"],
      size_type: ["small", "medium", "large", "mega"],
      source_health: ["ok", "stale", "error"],
      subject_level: ["HL", "SL", "A_LEVEL"],
      teaching_style: ["academic", "practical", "mixed"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
