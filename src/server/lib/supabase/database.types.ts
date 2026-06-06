/**
 * Tipos del esquema `public` de la base.
 *
 * Escrito a mano siguiendo el formato de `supabase gen types typescript`,
 * porque generarlo automáticamente requiere Docker (`--db-url`) o un access
 * token del Management API (`--project-id`). Mantener en sincronía con las
 * migraciones de `supabase/migrations`.
 *
 * Para regenerar con la CLI (si tenés Docker o token):
 *   npx supabase gen types typescript --project-id <ref> --schema public
 */

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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      materias: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          docente_id: string | null;
          cupo: number;
          periodo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          docente_id?: string | null;
          cupo?: number;
          periodo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          docente_id?: string | null;
          cupo?: number;
          periodo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "materias_docente_id_fkey";
            columns: ["docente_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      inscripciones: {
        Row: {
          id: string;
          materia_id: string;
          estudiante_id: string;
          estado: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          materia_id: string;
          estudiante_id: string;
          estado?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          materia_id?: string;
          estudiante_id?: string;
          estado?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inscripciones_materia_id_fkey";
            columns: ["materia_id"];
            isOneToOne: false;
            referencedRelation: "materias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inscripciones_estudiante_id_fkey";
            columns: ["estudiante_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notas: {
        Row: {
          id: string;
          inscripcion_id: string;
          descripcion: string;
          valor: number;
          docente_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inscripcion_id: string;
          descripcion: string;
          valor: number;
          docente_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inscripcion_id?: string;
          descripcion?: string;
          valor?: number;
          docente_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notas_inscripcion_id_fkey";
            columns: ["inscripcion_id"];
            isOneToOne: false;
            referencedRelation: "inscripciones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notas_docente_id_fkey";
            columns: ["docente_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trabajos_practicos: {
        Row: {
          id: string;
          materia_id: string;
          titulo: string;
          consigna: string | null;
          fecha_entrega: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          materia_id: string;
          titulo: string;
          consigna?: string | null;
          fecha_entrega?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          materia_id?: string;
          titulo?: string;
          consigna?: string | null;
          fecha_entrega?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trabajos_practicos_materia_id_fkey";
            columns: ["materia_id"];
            isOneToOne: false;
            referencedRelation: "materias";
            referencedColumns: ["id"];
          },
        ];
      };
      entregas: {
        Row: {
          id: string;
          trabajo_practico_id: string;
          estudiante_id: string;
          archivo_path: string | null;
          comentario: string | null;
          calificacion: number | null;
          feedback: string | null;
          corregido_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trabajo_practico_id: string;
          estudiante_id: string;
          archivo_path?: string | null;
          comentario?: string | null;
          calificacion?: number | null;
          feedback?: string | null;
          corregido_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trabajo_practico_id?: string;
          estudiante_id?: string;
          archivo_path?: string | null;
          comentario?: string | null;
          calificacion?: number | null;
          feedback?: string | null;
          corregido_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entregas_trabajo_practico_id_fkey";
            columns: ["trabajo_practico_id"];
            isOneToOne: false;
            referencedRelation: "trabajos_practicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entregas_estudiante_id_fkey";
            columns: ["estudiante_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      eventos_calendario: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string | null;
          fecha_inicio: string;
          fecha_fin: string | null;
          materia_id: string | null;
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion?: string | null;
          fecha_inicio: string;
          fecha_fin?: string | null;
          materia_id?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          descripcion?: string | null;
          fecha_inicio?: string;
          fecha_fin?: string | null;
          materia_id?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eventos_calendario_materia_id_fkey";
            columns: ["materia_id"];
            isOneToOne: false;
            referencedRelation: "materias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eventos_calendario_creado_por_fkey";
            columns: ["creado_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      avisos: {
        Row: {
          id: string;
          titulo: string;
          contenido: string;
          materia_id: string | null;
          autor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          contenido: string;
          materia_id?: string | null;
          autor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          contenido?: string;
          materia_id?: string | null;
          autor_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avisos_materia_id_fkey";
            columns: ["materia_id"];
            isOneToOne: false;
            referencedRelation: "materias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avisos_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_docente_of_materia: {
        Args: { p_materia_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "estudiante" | "docente" | "administrador";
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Helpers de conveniencia. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
