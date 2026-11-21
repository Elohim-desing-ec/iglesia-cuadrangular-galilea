-- Testimonios: que se publiquen solos (ejecutar una vez en SQL Editor → Run).
-- Cada testimonio nuevo entra ya aprobado. Para quitar uno: Table Editor → testimonios_web → borrar la fila,
-- o desmarcar "aprobado" para ocultarlo sin borrarlo.
alter table public.testimonios_web alter column aprobado set default true;
drop policy if exists "la web puede enviar testimonios sin aprobar" on public.testimonios_web;
create policy "la web puede enviar testimonios" on public.testimonios_web
  for insert to anon with check (aprobado);
