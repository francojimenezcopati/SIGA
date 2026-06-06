-- =============================================================
-- SIGA — Row Level Security (segunda barrera de autorización)
-- Las políticas apuntan al rol `authenticated`. El `service_role` (cliente
-- admin del backend) saltea RLS por diseño; `anon` no tiene políticas y por
-- lo tanto no accede a nada.
-- =============================================================

-- ------------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;

-- SELECT: el propio perfil; docentes y admins ven todos (necesitan datos de
-- los alumnos). Un estudiante solo se ve a sí mismo.
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.current_user_role() in ('docente', 'administrador')
  );

-- UPDATE: el propio perfil o un admin. (El cambio de `role` lo bloquea el
-- trigger enforce_profile_role_change para no-admins.)
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- INSERT: solo admin. El alta normal la hace el trigger handle_new_user.
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.is_admin());

-- DELETE: solo admin.
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------------
-- materias
-- ------------------------------------------------------------------
alter table public.materias enable row level security;

-- SELECT: cualquier usuario autenticado lista las materias.
create policy materias_select on public.materias
  for select to authenticated
  using (true);

-- INSERT: docentes y admins.
create policy materias_insert on public.materias
  for insert to authenticated
  with check (public.current_user_role() in ('docente', 'administrador'));

-- UPDATE: el docente a cargo o un admin.
create policy materias_update on public.materias
  for update to authenticated
  using (docente_id = auth.uid() or public.is_admin())
  with check (docente_id = auth.uid() or public.is_admin());

-- DELETE: solo admin.
create policy materias_delete on public.materias
  for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------------
-- inscripciones
-- ------------------------------------------------------------------
alter table public.inscripciones enable row level security;

-- SELECT: el estudiante dueño, el docente de la materia, o admin.
create policy inscripciones_select on public.inscripciones
  for select to authenticated
  using (
    estudiante_id = auth.uid()
    or public.is_admin()
    or public.is_docente_of_materia(materia_id)
  );

-- INSERT: el propio estudiante se inscribe a sí mismo.
create policy inscripciones_insert on public.inscripciones
  for insert to authenticated
  with check (
    estudiante_id = auth.uid()
    and public.current_user_role() = 'estudiante'
  );

-- UPDATE: el estudiante (p. ej. baja), el docente de la materia, o admin.
create policy inscripciones_update on public.inscripciones
  for update to authenticated
  using (
    estudiante_id = auth.uid()
    or public.is_admin()
    or public.is_docente_of_materia(materia_id)
  )
  with check (
    estudiante_id = auth.uid()
    or public.is_admin()
    or public.is_docente_of_materia(materia_id)
  );

-- DELETE: el propio estudiante o admin.
create policy inscripciones_delete on public.inscripciones
  for delete to authenticated
  using (estudiante_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------
-- notas (autorización vía la inscripción -> materia)
-- ------------------------------------------------------------------
alter table public.notas enable row level security;

-- SELECT: el estudiante dueño de la inscripción, el docente de la materia, o admin.
create policy notas_select on public.notas
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.inscripciones i
      where i.id = notas.inscripcion_id
        and (i.estudiante_id = auth.uid() or public.is_docente_of_materia(i.materia_id))
    )
  );

-- INSERT / UPDATE / DELETE: el docente de la materia o admin.
create policy notas_insert on public.notas
  for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.inscripciones i
      where i.id = notas.inscripcion_id
        and public.is_docente_of_materia(i.materia_id)
    )
  );

create policy notas_update on public.notas
  for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.inscripciones i
      where i.id = notas.inscripcion_id and public.is_docente_of_materia(i.materia_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.inscripciones i
      where i.id = notas.inscripcion_id and public.is_docente_of_materia(i.materia_id)
    )
  );

create policy notas_delete on public.notas
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.inscripciones i
      where i.id = notas.inscripcion_id and public.is_docente_of_materia(i.materia_id)
    )
  );

-- ------------------------------------------------------------------
-- trabajos_practicos
-- ------------------------------------------------------------------
alter table public.trabajos_practicos enable row level security;

-- SELECT: inscriptos en la materia, el docente de la materia, o admin.
create policy trabajos_practicos_select on public.trabajos_practicos
  for select to authenticated
  using (
    public.is_admin()
    or public.is_docente_of_materia(materia_id)
    or exists (
      select 1
      from public.inscripciones i
      where i.materia_id = trabajos_practicos.materia_id
        and i.estudiante_id = auth.uid()
    )
  );

-- INSERT / UPDATE / DELETE: el docente de la materia o admin.
create policy trabajos_practicos_insert on public.trabajos_practicos
  for insert to authenticated
  with check (public.is_admin() or public.is_docente_of_materia(materia_id));

create policy trabajos_practicos_update on public.trabajos_practicos
  for update to authenticated
  using (public.is_admin() or public.is_docente_of_materia(materia_id))
  with check (public.is_admin() or public.is_docente_of_materia(materia_id));

create policy trabajos_practicos_delete on public.trabajos_practicos
  for delete to authenticated
  using (public.is_admin() or public.is_docente_of_materia(materia_id));

-- ------------------------------------------------------------------
-- entregas (autorización vía el TP -> materia)
-- ------------------------------------------------------------------
alter table public.entregas enable row level security;

-- SELECT: el estudiante dueño, el docente de la materia del TP, o admin.
create policy entregas_select on public.entregas
  for select to authenticated
  using (
    estudiante_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.trabajos_practicos tp
      where tp.id = entregas.trabajo_practico_id
        and public.is_docente_of_materia(tp.materia_id)
    )
  );

-- INSERT: el propio estudiante, inscripto (activo) en la materia del TP.
create policy entregas_insert on public.entregas
  for insert to authenticated
  with check (
    estudiante_id = auth.uid()
    and exists (
      select 1
      from public.trabajos_practicos tp
      join public.inscripciones i on i.materia_id = tp.materia_id
      where tp.id = entregas.trabajo_practico_id
        and i.estudiante_id = auth.uid()
        and i.estado = 'activa'
    )
  );

-- UPDATE: el estudiante dueño (reenviar), el docente de la materia (corregir), o admin.
create policy entregas_update on public.entregas
  for update to authenticated
  using (
    estudiante_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.trabajos_practicos tp
      where tp.id = entregas.trabajo_practico_id and public.is_docente_of_materia(tp.materia_id)
    )
  )
  with check (
    estudiante_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.trabajos_practicos tp
      where tp.id = entregas.trabajo_practico_id and public.is_docente_of_materia(tp.materia_id)
    )
  );

-- DELETE: el estudiante dueño o admin.
create policy entregas_delete on public.entregas
  for delete to authenticated
  using (estudiante_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------
-- eventos_calendario
-- ------------------------------------------------------------------
alter table public.eventos_calendario enable row level security;

-- SELECT: todos los autenticados.
create policy eventos_calendario_select on public.eventos_calendario
  for select to authenticated
  using (true);

-- INSERT / UPDATE / DELETE: admin para cualquiera; docente solo para eventos
-- de sus materias (materia_id no nulo y a su cargo).
create policy eventos_calendario_insert on public.eventos_calendario
  for insert to authenticated
  with check (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );

create policy eventos_calendario_update on public.eventos_calendario
  for update to authenticated
  using (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  )
  with check (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );

create policy eventos_calendario_delete on public.eventos_calendario
  for delete to authenticated
  using (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );

-- ------------------------------------------------------------------
-- avisos
-- ------------------------------------------------------------------
alter table public.avisos enable row level security;

-- SELECT: todos los autenticados.
create policy avisos_select on public.avisos
  for select to authenticated
  using (true);

-- INSERT / UPDATE / DELETE: admin para cualquiera; docente solo para avisos
-- de sus materias.
create policy avisos_insert on public.avisos
  for insert to authenticated
  with check (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );

create policy avisos_update on public.avisos
  for update to authenticated
  using (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  )
  with check (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );

create policy avisos_delete on public.avisos
  for delete to authenticated
  using (
    public.is_admin()
    or (materia_id is not null and public.is_docente_of_materia(materia_id))
  );
