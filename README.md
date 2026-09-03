# Backend Engineering Notes Web

React + TypeScript + Vite frontend for Backend Engineering Notes.

## Local development

The frontend can read content from either:

- the backend API
- the static markdown files in `public/content`

Create a local env file from `.env.example` and use API mode for normal development:

```sh
npm install
npm run dev
```

Default local settings:

```env
VITE_CONTENT_SOURCE=api
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_BASE_PATH=/
```

Run the backend separately at `http://localhost:8080`. The backend already allows `http://localhost:5173` through CORS by default.

## Static mode

If you want the old GitHub Pages style content mode, switch to:

```env
VITE_CONTENT_SOURCE=markdown
VITE_APP_BASE_PATH=/backend-engineering-notes/
```

That will load the content manifest and markdown files from `public/content` instead of the backend API.
