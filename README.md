# Judini Boilerplate

This project is a simple boilerplate for Judini, utilizing Vite as the build tool and development server.

## Package.json

```json
{
  "name": "Judini Boilerplate",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^4.3.2"
  },
  "dependencies": {
    "@microsoft/fetch-event-source": "^2.0.1"
  }
}
```

## Scripts

```
dev: Run the Vite development server.
build: Build the project for production use.
preview: Preview the production build locally.
```