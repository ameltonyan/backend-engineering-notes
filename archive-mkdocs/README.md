# Backend Engineering Notes

A personal knowledge base for backend engineering topics such as Java, JVM internals, concurrency, Spring, databases, Kafka, Kubernetes, and system design.

Live site: https://ameltonyan.github.io/backend-engineering-notes/

## Quick start with MkDocs

### 1) Install Python dependencies

```bash
pip install mkdocs-material
```

### 2) Run locally

```bash
mkdocs serve
```

Then open:

```text
http://127.0.0.1:8000
```

### 3) Build the site

```bash
mkdocs build
```

This generates the static site in the `site/` folder.

### 4) Deploy to GitHub Pages

```bash
mkdocs gh-deploy --force
```

This builds the site and publishes it to the `gh-pages` branch, which can be used by GitHub Pages.

## Project structure

- `docs/` - Markdown source files
- `mkdocs.yml` - MkDocs configuration and navigation
- `site/` - Generated static output

## Add a new page

1. Create a new Markdown file inside `docs/`
2. Add it to the navigation in `mkdocs.yml`
3. Run `mkdocs serve` to preview it locally

## Purpose

These notes are intended to be:

- a long-term engineering reference
- interview preparation material
- a place to document concepts, patterns, and experience
