-- Testimonios (testimonios.html). Pegar y ejecutar en Supabase → proyecto Web-Galilea → SQL Editor → Run.
-- Solo agrega la tabla nueva "testimonios_web"; no toca la tabla de mensajes de contacto ni la tabla "testimonios"
-- antigua (texto/autor/detalle), que la web no usa.
-- Los testimonios se publican solos (aprobado = true por defecto). Para quitar uno: Table Editor → testimonios_web →
-- borrar la fila, o desmarcar "aprobado" para ocultarlo sin borrarlo. (Cambio aplicado con testimonios-auto.sql.)
create table if not exists public.testimonios_web (
  id bigint generated always as identity primary key,
  nombre     text check (char_length(nombre) <= 80),
  titulo     text not null check (char_length(titulo) between 3 and 120),
  categoria  text not null default 'Otro' check (categoria in ('Salvación','Sanidad','Familia','Provisión','Liberación','Otro')),
  testimonio text not null check (char_length(testimonio) between 20 and 2000),
  aprobado   boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.testimonios_web enable row level security;
create policy "todos ven los testimonios aprobados" on public.testimonios_web
  for select to anon using (aprobado);
create policy "la web puede enviar testimonios" on public.testimonios_web
  for insert to anon with check (aprobado);
create index if not exists testimonios_web_aprobados_idx on public.testimonios_web (created_at desc) where aprobado;
revoke all on public.testimonios_web from anon;
grant insert (nombre, titulo, categoria, testimonio) on public.testimonios_web to anon;
grant select (id, nombre, titulo, categoria, testimonio, created_at) on public.testimonios_web to anon;
