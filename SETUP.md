# Comunitaria II — Setup y Deploy

Guía completa para poner el proyecto en producción desde cero.

---

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**
2. Elige un nombre (p. ej. `comunitaria-app`), región EU West y contraseña de BD.
3. Espera a que el proyecto esté activo (~30 s).

---

## 2. Ejecutar el schema SQL

1. En Supabase: **SQL Editor → New Query**
2. Pega todo el contenido de `supabase/schema.sql`
3. Pulsa **Run** (▶)

Esto crea las tablas (`profiles`, `questions`, `exam_sessions`, `user_failed`), las políticas RLS, el trigger de auto-creación de perfil y la vista `ranking`.

---

## 3. Obtener las credenciales de Supabase

En **Project Settings → API**:

| Variable | Dónde está |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (¡mantenla secreta!) |

---

## 4. Crear `.env.local`

En la raíz del proyecto crea el archivo `.env.local` (ya está en `.gitignore`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Sembrar las preguntas (seed)

El script lee el archivo `data.js` original y sube las 490 preguntas a Supabase.

```bash
# Asegúrate de que data.js está en la ruta correcta
# Edita scripts/seed-questions.mjs si la ruta difiere

node --env-file=.env.local scripts/seed-questions.mjs
```

Debería imprimir algo como:
```
Seeding 490 questions in batches of 100...
Batch 1/5 OK
Batch 2/5 OK
...
Done! 490 questions seeded.
```

---

## 6. Eliminar el archivo conflictivo

> ⚠️ **Importante**: el archivo `src/app/(app)/page.tsx` entra en conflicto con
> `src/app/page.tsx` porque ambos resuelven a la ruta `/`. Elimínalo antes de build:

```bash
del "src\app\(app)\page.tsx"
# o en macOS/Linux:
rm "src/app/(app)/page.tsx"
```

El dashboard está en `src/app/(app)/dashboard/page.tsx` (ruta `/dashboard`).

---

## 7. Probar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido a `/login`.

---

## 8. Dar rol admin

Para que tu usuario pueda acceder al panel de administración:

1. Regístrate en la app.
2. En Supabase → **Table Editor → profiles**
3. Encuentra tu fila y cambia `role` de `student` a `admin`.

---

## 9. Deploy en Vercel

1. Sube el proyecto a GitHub (si no está ya):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/comunitaria-app.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repositorio.

3. En **Environment Variables** añade las tres variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Pulsa **Deploy**. En ~2 minutos tendrás la URL de producción.

---

## Estructura de rutas

| Ruta | Descripción | Auth |
|---|---|---|
| `/login` | Inicio de sesión | Pública |
| `/register` | Registro | Pública |
| `/dashboard` | Panel principal, stats, progreso | ✅ |
| `/setup` | Configurar examen | ✅ |
| `/exam` | Motor de examen | ✅ |
| `/results` | Resultados del examen | ✅ |
| `/ranking` | Tabla de clasificación | ✅ |
| `/admin` | Panel de administración | Admin |

---

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Base de datos**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth + `@supabase/ssr`
- **Estilos**: CSS variables personalizadas + Tailwind 4
- **Deploy**: Vercel
