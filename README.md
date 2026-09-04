# Backend Engineering Notes Web

React + TypeScript + Vite frontend for Backend Engineering Notes.

## Local development

The frontend reads content from the backend API.

Create a local env file from `.env.example`:

```sh
npm install
npm run dev
```

Default local settings:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_BASE_PATH=/
```

Run the backend separately at `http://localhost:8080`. The backend already allows `http://localhost:5173` through CORS by default.

## GitHub Pages deployment

The GitHub Pages workflow builds the frontend in API mode. Add a repository variable named `VITE_API_BASE_URL` under **Settings > Secrets and variables > Actions > Variables**:

```text
https://YOUR_ORACLE_PUBLIC_HOST
```

Use the public URL of the running backend, including its port when the API is not behind HTTPS/Nginx, for example `http://203.0.113.10:8080`. The workflow supplies the `/backend-engineering-notes/` Pages base path automatically.

Configure the backend's `CORS_ALLOWED_ORIGINS` with the exact Pages origin, for example:

```text
https://ameltonyan.github.io
```

After adding the variable, push to `main` to build and deploy the frontend. Do not put database credentials in frontend environment variables; all `VITE_*` values are embedded in the browser bundle.

