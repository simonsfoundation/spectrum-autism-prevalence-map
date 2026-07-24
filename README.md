# Autism Prevalence Map

A Django 3.2 + PostgreSQL app with a Node-built front-end (Tailwind for CSS, esbuild bundling
the D3/TopoJSON map). With Docker you don't need Python, Node, or Postgres installed on your
host — only Docker Desktop.

- App runs Django's `runserver` inside the `app` container.
- Postgres runs in the `db` container.
- Your source is bind-mounted into `app`, so code edits reload live (no rebuild needed).

## Prerequisites

- Docker Desktop installed and running.

## Quick start

```bash
# 1. Create your local env file from the template
cp .env.sample .env

# 2. Build the image and start Postgres + Django
docker compose up -d --build

# 3. First run only: install front-end deps, then create the database schema
docker compose exec -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm install
docker compose exec app python manage.py migrate
docker compose exec app python manage.py createsuperuser   # optional

# 4. Compile the front-end (leave running in its own terminal for live reload)
docker compose exec -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm run dev
```

Then open the app: **http://localhost:8017** 

> Locally the app serves the **unminified** assets that `npm run dev` builds (the sample sets
> `FRONTEND_UNMINIFIED=True`), so keep step 4 running — or run it once and Ctrl-C to build without
> watching. `build_css.sh` is **not** used locally; it's the minified build for staging/production.
> `migrate` is required because the container runs only `runserver`, not migrations — skipping it
> gives `relation "..." does not exist` / HTTP 500 on first load.

## Configuration notes (`.env`)

- **`DJANGO_ALLOWED_HOSTS` must include the host you visit.** The sample's `127.0.0.1,localhost`
  covers both `localhost:8017` and `127.0.0.1:8017`.
- **`FRONTEND_UNMINIFIED`** (default `False`) picks which front-end assets are served: unset or
  `False` → the built, versioned `*.min.*` bundles from `npm run build` (staging/production);
  `True` → the unminified source assets from `npm run dev` (local). The sample sets it to `True`,
  and it's independent of the host, so it works on `localhost` and `127.0.0.1` alike.
- **`GMAP_API_KEY`** is used only server-side to geocode studies (admin save and the Google
  Sheets import); the public map renders without it. Keep the real value (from the team doc) in
  your git-ignored `.env` — never commit it to `.env.sample`.
- After editing `.env`, recreate the container so it re-reads the file (a plain `restart` won't
  pick up env changes):
  ```bash
  docker compose up -d --force-recreate app
  ```

## Everyday commands

```bash
# Tail app logs
docker compose logs -f app

# Watch & rebuild front-end assets during development (unminified, live reload)
docker compose exec -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm run dev

# Run any Django management command
docker compose exec app python manage.py <command>   # e.g. shell, makemigrations, migrate

# Rebuild the image after a Dockerfile / requirements.txt change
docker compose up -d --build

# Stop the stack (keeps the database)
docker compose down

# Stop and WIPE the database volume (fresh DB next start)
docker compose down -v
```

## Front-end development (live reload)

With `FRONTEND_UNMINIFIED=True` (the sample's default), the app serves the unminified source
assets, so you just need the watchers running. In a separate terminal:

```bash
docker compose exec -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm run dev
```

`npm run dev` runs Tailwind and esbuild in watch mode (via `concurrently`), rebuilding the
unminified `dist/main.css`, `dist/main.js`, and `dist/admin.js` whenever you edit the Tailwind
config or `ts/*.ts`. `runserver` auto-reloads on Python changes, so back end and front end both
refresh live — on both http://localhost:8017 and http://127.0.0.1:8017.

`build_css.sh` (which runs `npm run build`) produces the minified bundles and is used only by the
staging/production pipelines — you don't need it for local work.

## Notes

1. **Changing the schema.** Edit `models.py`, then run
   `docker compose exec app python manage.py makemigrations` to generate the migration file.
   Once it appears in `autism_prevalence_map/migrations/`, apply it with
   `docker compose exec app python manage.py migrate`.

2. **Accessing the PostgreSQL database.** `docker compose exec app python manage.py dbshell`
   (or connect a GUI client to `localhost:3317`).

3. **`GMAP_API_KEY`** is not hardcoded — it's read from `.env` for security, and used only for
   geocoding (see Configuration notes above).

4. **Importing data.** There's no production-data import script yet. After creating a superuser
   locally, get the CSV from the team's Google Drive and import it through the admin.
```
