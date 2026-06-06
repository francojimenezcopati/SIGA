-- =============================================================
-- SIGA — Esquema inicial
-- Enum de roles, tablas, funciones auxiliares y triggers.
-- (Las políticas RLS van en la migración 20260605120100_rls_policies.sql.)
-- =============================================================

-- Roles de la aplicación (RBAC).
create type public.user_role as enum ('estudiante', 'docente', 'administrador');

-- ------------------------------------------------------------------
-- profiles: 1–1 con auth.users. Guarda el rol y datos básicos del usuario.
-- ------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       public.user_role not null default 'estudiante',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Perfil de usuario con su rol. 1–1 con auth.users.';

-- ------------------------------------------------------------------
-- materias
-- ------------------------------------------------------------------
create table public.materias (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,
  nombre      text not null,
  descripcion text,
  docente_id  uuid references public.profiles (id) on delete set null,
  cupo        integer not null default 30 check (cupo >= 0),
  periodo     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index materias_docente_id_idx on public.materias (docente_id);

-- ------------------------------------------------------------------
-- inscripciones: estudiante <-> materia (una por par).
-- ------------------------------------------------------------------
create table public.inscripciones (
  id            uuid primary key default gen_random_uuid(),
  materia_id    uuid not null references public.materias (id) on delete cascade,
  estudiante_id uuid not null references public.profiles (id) on delete cascade,
  estado        text not null default 'activa' check (estado in ('activa', 'baja')),
  created_at    timestamptz not null default now(),
  unique (materia_id, estudiante_id)
);
create index inscripciones_materia_id_idx on public.inscripciones (materia_id);
create index inscripciones_estudiante_id_idx on public.inscripciones (estudiante_id);

-- ------------------------------------------------------------------
-- notas: calificaciones asociadas a una inscripción.
-- ------------------------------------------------------------------
create table public.notas (
  id             uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null references public.inscripciones (id) on delete cascade,
  descripcion    text not null,
  valor          numeric(4, 2) not null check (valor >= 0 and valor <= 10),
  docente_id     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index notas_inscripcion_id_idx on public.notas (inscripcion_id);

-- ------------------------------------------------------------------
-- trabajos_practicos
-- ------------------------------------------------------------------
create table public.trabajos_practicos (
  id            uuid primary key default gen_random_uuid(),
  materia_id    uuid not null references public.materias (id) on delete cascade,
  titulo        text not null,
  consigna      text,
  fecha_entrega timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index trabajos_practicos_materia_id_idx on public.trabajos_practicos (materia_id);

-- ------------------------------------------------------------------
-- entregas: archivo subido por un estudiante para un TP (una por par).
-- El archivo vive en Storage; aquí se guarda su path. Corrección opcional.
-- ------------------------------------------------------------------
create table public.entregas (
  id                  uuid primary key default gen_random_uuid(),
  trabajo_practico_id uuid not null references public.trabajos_practicos (id) on delete cascade,
  estudiante_id       uuid not null references public.profiles (id) on delete cascade,
  archivo_path        text,
  comentario          text,
  calificacion        numeric(4, 2) check (calificacion >= 0 and calificacion <= 10),
  feedback            text,
  corregido_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (trabajo_practico_id, estudiante_id)
);
create index entregas_trabajo_practico_id_idx on public.entregas (trabajo_practico_id);
create index entregas_estudiante_id_idx on public.entregas (estudiante_id);

-- ------------------------------------------------------------------
-- eventos_calendario: globales (materia_id null) o por materia.
-- ------------------------------------------------------------------
create table public.eventos_calendario (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text,
  fecha_inicio timestamptz not null,
  fecha_fin    timestamptz,
  materia_id   uuid references public.materias (id) on delete cascade,
  creado_por   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index eventos_calendario_materia_id_idx on public.eventos_calendario (materia_id);

-- ------------------------------------------------------------------
-- avisos: globales (materia_id null) o por materia.
-- ------------------------------------------------------------------
create table public.avisos (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  contenido  text not null,
  materia_id uuid references public.materias (id) on delete cascade,
  autor_id   uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index avisos_materia_id_idx on public.avisos (materia_id);

-- =============================================================
-- Funciones auxiliares
-- =============================================================

-- Mantiene updated_at en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Alta automática del profile al registrarse un usuario en auth.users.
-- El rol SIEMPRE arranca en 'estudiante': NO se confía en metadata del
-- cliente (evita auto-promoción). Un administrador lo promueve después.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

-- Rol del usuario actual. SECURITY DEFINER (corre como dueño, que saltea RLS)
-- para evitar recursión cuando se la usa dentro de las políticas de profiles.
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ¿El usuario actual es administrador?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'administrador', false);
$$;

-- ¿El usuario actual es el docente a cargo de la materia indicada?
create or replace function public.is_docente_of_materia(p_materia_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.materias m
    where m.id = p_materia_id
      and m.docente_id = auth.uid()
  );
$$;

-- Bloquea que un usuario no-admin cambie su propio 'role'. Solo aplica a
-- requests de usuarios autenticados; el service_role / postgres (seed, ABM
-- de admin) puede cambiarlo.
create or replace function public.enforce_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user = 'authenticated'
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el rol.';
  end if;
  return new;
end;
$$;

-- =============================================================
-- Triggers
-- =============================================================
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger profiles_enforce_role_change
  before update on public.profiles
  for each row execute function public.enforce_profile_role_change();

create trigger materias_set_updated_at
  before update on public.materias
  for each row execute function public.set_updated_at();

create trigger notas_set_updated_at
  before update on public.notas
  for each row execute function public.set_updated_at();

create trigger trabajos_practicos_set_updated_at
  before update on public.trabajos_practicos
  for each row execute function public.set_updated_at();

create trigger entregas_set_updated_at
  before update on public.entregas
  for each row execute function public.set_updated_at();

-- Profile automático al crear el usuario en auth.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
