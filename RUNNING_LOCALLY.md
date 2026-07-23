# Running the Autism Prevalence Map Locally (Docker)

A Django 3.2 + PostgreSQL app with a Node-built front-end. With Docker you don't need
Python, Node, or Postgres installed on your host — only Docker Desktop.

- App runs Django's `runserver` inside the `app` container.
- Postgres runs in the `db` container.
- Your source is bind-mounted into `app`, so code edits reload live (no rebuild needed).

## Prerequisites

- Docker Desktop installed and running.

## Quick start

```bash
# 1. Create your local env file from the template
cp .env.sample .env

# 2. Build the Docker image and the front-end assets (Tailwind/esbuild -> dist/*.min.*)
./codepipeline/build_css.sh

# 3. Start the stack (Postgres + Django). build_css.sh already built the image.
docker compose up -d

# 4. First run only: create the database schema
docker compose exec app python manage.py migrate

# 5. Optional: create an admin login
docker compose exec app python manage.py createsuperuser
```

Then open the app: **http://localhost:8017**

## Configuration notes (`.env`)

Copy `.env.sample` and keep these in mind:

- **`DJANGO_ALLOWED_HOSTS` must be `127.0.0.1,localhost`** (the sample's value). Do **not** set it
  to bare `127.0.0.1`:
- After editing `.env`, recreate the container so it re-reads the file (a plain `restart`
  won't pick up env changes):
  ```bash
  docker compose up -d --force-recreate app
  ```

## Everyday commands

```bash
# Tail app logs
docker compose logs -f app

# Rebuild front-end assets after changing front-end source
./codepipeline/build_css.sh

# Django management commands
docker compose exec app python manage.py <command>   # e.g. shell, makemigrations, migrate

# Rebuild the image after a Dockerfile / requirements.txt change
docker compose up -d --build

# Stop the stack (keeps the database)
docker compose down

# Stop and WIPE the database volume (fresh DB next start)
docker compose down -v
```
