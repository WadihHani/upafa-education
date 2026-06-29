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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessment_submissions: {
        Row: {
          assessment_id: string
          content: string
          feedback: string
          file_path: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          link_url: string | null
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          student_user_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          content?: string
          feedback?: string
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          link_url?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_user_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          content?: string
          feedback?: string
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          link_url?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_user_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string
          due_at: string | null
          id: string
          is_published: boolean
          kind: Database["public"]["Enums"]["assessment_kind"]
          max_score: number
          resource_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string
          due_at?: string | null
          id?: string
          is_published?: boolean
          kind?: Database["public"]["Enums"]["assessment_kind"]
          max_score?: number
          resource_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          due_at?: string | null
          id?: string
          is_published?: boolean
          kind?: Database["public"]["Enums"]["assessment_kind"]
          max_score?: number
          resource_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          marked_by: string | null
          notes: string
          session_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_user_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          marked_by?: string | null
          notes?: string
          session_date: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_user_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          marked_by?: string | null
          notes?: string
          session_date?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      conferences: {
        Row: {
          created_at: string
          date_text: string
          description: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_text?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_text?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      course_meetings: {
        Row: {
          course_id: string
          created_at: string
          description: string
          ended_at: string | null
          id: string
          meet_url: string
          scheduled_at: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          ended_at?: string | null
          id?: string
          meet_url: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          ended_at?: string | null
          id?: string
          meet_url?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_meetings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_messages: {
        Row: {
          body: string
          course_id: string
          created_at: string
          id: string
          is_read: boolean
          recipient_user_id: string
          sender_user_id: string
        }
        Insert: {
          body: string
          course_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_user_id: string
          sender_user_id: string
        }
        Update: {
          body?: string
          course_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_user_id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string | null
          created_at: string
          description: string
          id: string
          is_open_for_enrollment: boolean
          kuliya_id: string | null
          level: string | null
          teacher_user_id: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string
          id?: string
          is_open_for_enrollment?: boolean
          kuliya_id?: string | null
          level?: string | null
          teacher_user_id: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string
          id?: string
          is_open_for_enrollment?: boolean
          kuliya_id?: string | null
          level?: string | null
          teacher_user_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_kuliya_id_fkey"
            columns: ["kuliya_id"]
            isOneToOne: false
            referencedRelation: "kuliyat"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          requested_at: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_user_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_user_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          enrollment_id: string
          graded_at: string
          graded_by: string | null
          id: string
          max_score: number | null
          notes: string | null
          score: number | null
          section: Database["public"]["Enums"]["grade_section"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          score?: number | null
          section: Database["public"]["Enums"]["grade_section"]
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          score?: number | null
          section?: Database["public"]["Enums"]["grade_section"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string
          cta_text: string
          id: string
          image_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string
          cta_text?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string
          cta_text?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kuliyat: {
        Row: {
          admission_requirements: string | null
          bachelor_departments: Json
          created_at: string
          description: string | null
          display_order: number
          fees: string | null
          id: string
          image_url: string | null
          is_published: boolean
          master_departments: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          admission_requirements?: string | null
          bachelor_departments?: Json
          created_at?: string
          description?: string | null
          display_order?: number
          fees?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          master_departments?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          admission_requirements?: string | null
          bachelor_departments?: Json
          created_at?: string
          description?: string | null
          display_order?: number
          fees?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          master_departments?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      lecture_materials: {
        Row: {
          course_id: string
          created_at: string
          description: string
          external_url: string | null
          file_mime: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          material_type: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          external_url?: string | null
          file_mime?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          material_type?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          external_url?: string | null
          file_mime?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          material_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_recordings: {
        Row: {
          course_id: string
          created_at: string
          duration_seconds: number | null
          file_path: string
          id: string
          meeting_id: string | null
          mime_type: string
          recorded_by: string
          size_bytes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          id?: string
          meeting_id?: string | null
          mime_type?: string
          recorded_by: string
          size_bytes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          id?: string
          meeting_id?: string | null
          mime_type?: string
          recorded_by?: string
          size_bytes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_recordings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecture_recordings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "course_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      mofadla_application_grades: {
        Row: {
          application_id: string
          created_at: string
          id: string
          max_score: number
          score: number
          sort_order: number
          subject: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          max_score?: number
          score?: number
          sort_order?: number
          subject: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          max_score?: number
          score?: number
          sort_order?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "mofadla_application_grades_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mofadla_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      mofadla_application_preferences: {
        Row: {
          application_id: string
          created_at: string
          id: string
          preference_order: number
          program_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          preference_order: number
          program_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          preference_order?: number
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mofadla_application_preferences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mofadla_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mofadla_application_preferences_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "mofadla_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      mofadla_applications: {
        Row: {
          accepted_program_id: string | null
          address: string
          admin_notes: string
          birth_date: string | null
          branch: Database["public"]["Enums"]["mofadla_branch"]
          created_at: string
          decided_at: string | null
          decided_by: string | null
          email: string
          exam_number: string
          full_name: string
          gender: string
          graduation_year: number | null
          id: string
          national_id: string
          notes: string
          payment_receipt_url: string
          phone: string
          status: Database["public"]["Enums"]["application_status"]
          total_score: number
          updated_at: string
        }
        Insert: {
          accepted_program_id?: string | null
          address?: string
          admin_notes?: string
          birth_date?: string | null
          branch: Database["public"]["Enums"]["mofadla_branch"]
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          exam_number?: string
          full_name: string
          gender?: string
          graduation_year?: number | null
          id?: string
          national_id: string
          notes?: string
          payment_receipt_url?: string
          phone?: string
          status?: Database["public"]["Enums"]["application_status"]
          total_score?: number
          updated_at?: string
        }
        Update: {
          accepted_program_id?: string | null
          address?: string
          admin_notes?: string
          birth_date?: string | null
          branch?: Database["public"]["Enums"]["mofadla_branch"]
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          exam_number?: string
          full_name?: string
          gender?: string
          graduation_year?: number | null
          id?: string
          national_id?: string
          notes?: string
          payment_receipt_url?: string
          phone?: string
          status?: Database["public"]["Enums"]["application_status"]
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mofadla_applications_accepted_program_id_fkey"
            columns: ["accepted_program_id"]
            isOneToOne: false
            referencedRelation: "mofadla_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      mofadla_programs: {
        Row: {
          created_at: string
          description: string
          faculty: string
          id: string
          is_open: boolean
          min_score: number
          name: string
          required_branch: Database["public"]["Enums"]["mofadla_branch"]
          seats: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          faculty?: string
          id?: string
          is_open?: boolean
          min_score?: number
          name: string
          required_branch?: Database["public"]["Enums"]["mofadla_branch"]
          seats?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          faculty?: string
          id?: string
          is_open?: boolean
          min_score?: number
          name?: string
          required_branch?: Database["public"]["Enums"]["mofadla_branch"]
          seats?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      mofadla_quick_registrations: {
        Row: {
          address: string
          admin_notes: string
          average: number
          birth_date: string | null
          certificate_url: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          email: string
          father_name: string
          full_name: string
          graduation_year: number | null
          id: string
          last_certificate: string
          mother_name: string
          national_id: string
          national_id_url: string
          notes: string
          payment_receipt_url: string
          personal_photo_url: string
          phone: string
          status: Database["public"]["Enums"]["quick_registration_status"]
          updated_at: string
        }
        Insert: {
          address?: string
          admin_notes?: string
          average?: number
          birth_date?: string | null
          certificate_url?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          father_name?: string
          full_name: string
          graduation_year?: number | null
          id?: string
          last_certificate?: string
          mother_name?: string
          national_id: string
          national_id_url?: string
          notes?: string
          payment_receipt_url?: string
          personal_photo_url?: string
          phone: string
          status?: Database["public"]["Enums"]["quick_registration_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          admin_notes?: string
          average?: number
          birth_date?: string | null
          certificate_url?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          father_name?: string
          full_name?: string
          graduation_year?: number | null
          id?: string
          last_certificate?: string
          mother_name?: string
          national_id?: string
          national_id_url?: string
          notes?: string
          payment_receipt_url?: string
          personal_photo_url?: string
          phone?: string
          status?: Database["public"]["Enums"]["quick_registration_status"]
          updated_at?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          href: string
          id: string
          is_active: boolean
          label: string
          location: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          label: string
          location: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          label?: string
          location?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          is_active: boolean
          is_highlighted: boolean
          key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          key: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          category_id: string
          content: string
          cover_image_url: string | null
          created_at: string
          external_link: string | null
          id: string
          is_published: boolean
          published_at: string
          slug: string | null
          sort_order: number
          summary: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          category_id: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          slug?: string | null
          sort_order?: number
          summary?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          category_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          slug?: string | null
          sort_order?: number
          summary?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo: {
        Row: {
          created_at: string
          description: string | null
          id: string
          noindex: boolean
          og_image_url: string | null
          path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portal_items: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          link_url: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          link_url?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          link_url?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kuliya_id: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kuliya_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kuliya_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_kuliya_id_fkey"
            columns: ["kuliya_id"]
            isOneToOne: false
            referencedRelation: "kuliyat"
            referencedColumns: ["id"]
          },
        ]
      }
      program_courses: {
        Row: {
          category: string
          code: string
          created_at: string
          credit_hours: number
          description: string
          id: string
          level: string
          prerequisite: string
          program_name: string
          program_slug: string
          semester: number | null
          sort_order: number
          title_ar: string
          updated_at: string
          year: number
        }
        Insert: {
          category?: string
          code?: string
          created_at?: string
          credit_hours?: number
          description?: string
          id?: string
          level?: string
          prerequisite?: string
          program_name?: string
          program_slug: string
          semester?: number | null
          sort_order?: number
          title_ar: string
          updated_at?: string
          year?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          credit_hours?: number
          description?: string
          id?: string
          level?: string
          prerequisite?: string
          program_name?: string
          program_slug?: string
          semester?: number | null
          sort_order?: number
          title_ar?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string | null
          content_type: string
          group_key: string
          id: string
          image_url: string | null
          is_hidden: boolean
          label: string | null
          link_url: string | null
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_type?: string
          group_key?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          label?: string | null
          link_url?: string | null
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_type?: string
          group_key?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          label?: string | null
          link_url?: string | null
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_read: boolean
          note: string
          student_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean
          note: string
          student_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean
          note?: string
          student_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string
          category: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_course_enrolled_student: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      is_course_teacher: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_mofadla_quick_registration: {
        Args: {
          p_address?: string
          p_average?: number
          p_birth_date?: string
          p_certificate_url?: string
          p_email?: string
          p_father_name?: string
          p_full_name: string
          p_graduation_year?: number
          p_last_certificate?: string
          p_mother_name?: string
          p_national_id?: string
          p_national_id_url?: string
          p_payment_receipt_url?: string
          p_personal_photo_url?: string
          p_phone?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "teacher" | "student"
      application_status: "pending" | "accepted" | "rejected" | "waitlisted"
      assessment_kind: "quiz" | "assignment" | "project" | "exam"
      attendance_status: "present" | "absent" | "late" | "excused"
      enrollment_status: "pending" | "approved" | "rejected"
      grade_section:
        | "recorded_lectures"
        | "attendance"
        | "quizzes"
        | "midterm"
        | "activities"
        | "projects"
        | "final"
        | "overall"
      mofadla_branch:
        | "scientific"
        | "literary"
        | "both"
        | "industrial"
        | "vocational"
        | "arts"
        | "sharia"
      quick_registration_status: "pending" | "approved" | "rejected"
      submission_status: "submitted" | "graded" | "late"
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
      app_role: ["admin", "user", "teacher", "student"],
      application_status: ["pending", "accepted", "rejected", "waitlisted"],
      assessment_kind: ["quiz", "assignment", "project", "exam"],
      attendance_status: ["present", "absent", "late", "excused"],
      enrollment_status: ["pending", "approved", "rejected"],
      grade_section: [
        "recorded_lectures",
        "attendance",
        "quizzes",
        "midterm",
        "activities",
        "projects",
        "final",
        "overall",
      ],
      mofadla_branch: [
        "scientific",
        "literary",
        "both",
        "industrial",
        "vocational",
        "arts",
        "sharia",
      ],
      quick_registration_status: ["pending", "approved", "rejected"],
      submission_status: ["submitted", "graded", "late"],
    },
  },
} as const
