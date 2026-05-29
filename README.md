# NoteFlow V1 Supabase + GitHub Pages Deploy

## 1. Supabase
1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Authentication > URL Configuration:
   - Site URL: `https://aixuv.github.io/task/`
   - Redirect URLs:
     - `https://aixuv.github.io/task/`
     - `http://localhost:5173/`

## 2. GitHub
Upload all files in this folder to `https://github.com/aixuv/task`.

GitHub Pages should already be set to GitHub Actions. The included workflow deploys automatically on push to `main`.

## 3. Local testing
```bash
npm install
npm run dev
```

## 4. Login and user management
The first admin email is configured as:

`nikhilpareta16@gmail.com`

Admin can edit user roles and disable/enable users from the hidden User Management tab. Only Admin and Director can see User Management, but only Admin can edit rights.
