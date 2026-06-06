-- =============================================================
-- SIGA — Storage para archivos de Trabajos Prácticos
-- Bucket privado `entregas`. Convención de path: <auth.uid>/<...>/archivo
-- (la primera carpeta es el id del estudiante dueño del archivo).
-- =============================================================

insert into storage.buckets (id, name, public)
values ('entregas', 'entregas', false)
on conflict (id) do nothing;

-- Subir: el estudiante solo dentro de su propia carpeta (<uid>/...).
create policy "entregas_insert_propio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'entregas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Leer: el dueño del archivo, o staff (docente/admin) para corrección.
create policy "entregas_select_propio_o_staff"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'entregas'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.current_user_role() in ('docente', 'administrador')
    )
  );

-- Actualizar (reemplazar archivo): solo el dueño.
create policy "entregas_update_propio"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'entregas'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'entregas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Borrar: el dueño o un admin.
create policy "entregas_delete_propio_o_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'entregas'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
