# Catálogo de perfumes (React + TypeScript + Tailwind + Supabase)

## 1. Correr local
Instalá Node 18+. En la carpeta: `npm install`, copiá `.env.example` a `.env` con tus datos de Supabase y ejecutá `npm run dev`.

## 2. Configurar Supabase
1. Creá un proyecto en supabase.com.
2. SQL Editor → pegá todo `supabase/schema.sql` → Run (crea tablas, permisos y el bucket de fotos).
3. Authentication → Sign In / Providers → Email: **desactivá "Allow new users to sign up"** (así nadie se registra).
4. Project Settings → API: copiá *Project URL* y la clave *anon public* al `.env`. (La anon key es pública por diseño; la seguridad la dan las políticas RLS. Nunca uses la `service_role`.)

## 3. Crear tu cuenta de administrador
1. Authentication → Users → Add user → tu correo + contraseña (marcá "Auto confirm").
2. SQL Editor: `insert into admins select id from auth.users where email='TU_CORREO';`
Solo las cuentas en la tabla `admins` pueden modificar datos (se valida en la base de datos).

## 4. Cargar perfumes
Entrá a `tu-sitio/#/admin`, iniciá sesión y tocá "Agregar perfume". Las fotos se achican automáticamente.

## 5. Número de WhatsApp
Panel → "Datos del local" → WhatsApp con código de país y sin signos (Argentina: `549` + código de área + número). Ahí también van Instagram, horarios y ubicación.

## 6. Publicar
Subí la carpeta a GitHub y conectala en Vercel, Netlify o Cloudflare Pages (build: `npm run build`, salida: `dist`). Cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables de entorno. Te dan un enlace https con SSL; podés sumar tu dominio después.

## Pendientes para vos
- Vista previa al compartir: subí una imagen `og.png` (1200×630) a `public/` y agregá en `index.html`: `<meta property="og:image" content="https://TU-DOMINIO/og.png"/>`.
- PWA: para que Android muestre "Instalar", agregá `icon-192.png` y `icon-512.png` en `public/` y listalos en `manifest.webmanifest`.
