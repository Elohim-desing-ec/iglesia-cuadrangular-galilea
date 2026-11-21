-- Base de datos de la web de Iglesia Galilea (proyecto "galilea-web" en Supabase).
-- Visitantes sin sesión (rol anon, la clave publicable de la web): solo pueden ENVIAR mensajes y testimonios,
-- y LEER testimonios aprobados. Nadie de afuera puede leer los mensajes de contacto ni los testimonios sin aprobar.

-- Mensajes del formulario de contacto (contacto.html, ingles.html)
create table if not exists public.mensajes_contacto (
  id bigint generated always as identity primary key,
  nombre   text not null check (char_length(nombre) between 1 and 80),
  correo   text not null check (char_length(correo) between 3 and 120),
  telefono text check (char_length(telefono) <= 25),
  motivo   text check (char_length(motivo) <= 60),
  mensaje  text not null check (char_length(mensaje) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.mensajes_contacto enable row level security;
create policy "la web puede enviar mensajes" on public.mensajes_contacto
  for insert to anon with check (true);

-- Testimonios (testimonios.html). Se publican cuando alguien de la iglesia marca "aprobado" en el panel.
create table if not exists public.testimonios (
  id bigint generated always as identity primary key,
  nombre     text check (char_length(nombre) <= 80),
  titulo     text not null check (char_length(titulo) between 3 and 120),
  categoria  text not null default 'Otro' check (categoria in ('Salvación','Sanidad','Familia','Provisión','Liberación','Otro')),
  testimonio text not null check (char_length(testimonio) between 20 and 2000),
  aprobado   boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.testimonios enable row level security;
create policy "todos ven los testimonios aprobados" on public.testimonios
  for select to anon using (aprobado);
create policy "la web puede enviar testimonios sin aprobar" on public.testimonios
  for insert to anon with check (aprobado = false);
create index if not exists testimonios_aprobados_idx on public.testimonios (created_at desc) where aprobado;

-- la web solo toca estas columnas
revoke all on public.mensajes_contacto, public.testimonios from anon;
grant insert (nombre, correo, telefono, motivo, mensaje) on public.mensajes_contacto to anon;
grant insert (nombre, titulo, categoria, testimonio) on public.testimonios to anon;
grant select (id, nombre, titulo, categoria, testimonio, created_at) on public.testimonios to anon;
