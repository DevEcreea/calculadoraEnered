# Calculadora Enered · DU 004-2026 — PRD

## Problem Statement (verbatim)
Conectar la calculadora con la plataforma Red-Enered:

1. **Variables de entorno** (en `.env` y en Netlify):
   ```
   REACT_APP_API_URL=https://api.enered.pe
   REACT_APP_PLATAFORMA_URL=https://enered.netlify.app
   ```
   (Mientras no haya dominio `api.enered.pe`, usar `http://localhost:8001` o la URL de Render del backend.)

2. **Botón "Empezar mi registro"** (pantalla final de resultado): antes de redirigir, hacer `POST ${REACT_APP_API_URL}/api/calculations` con el payload del cálculo. Luego redirigir a:
   - `${REACT_APP_PLATAFORMA_URL}/registro-subsidio?calc_id=...` si califica
   - `${REACT_APP_PLATAFORMA_URL}/no-califica?calc_id=...` si no califica

El endpoint `POST /api/calculations` es **público** (vive en otro proyecto, la plataforma Red-Enered) y devuelve `{ "calc_id": "uuid", "subsidio_estimado": 20000, "califica": true, "created_at": "..." }`.

## Architecture
- Frontend-only React 18 (Create React App) + Tailwind 3.4
- Calculadora SPA en `/app/frontend/`
- Backend NO se implementa en este repo; vive en el proyecto de la plataforma Red-Enered

## What's been implemented (2026-01)
- [x] `axios` instalado (yarn add axios)
- [x] `/app/frontend/.env` con `REACT_APP_API_URL` y `REACT_APP_PLATAFORMA_URL`
- [x] `/app/frontend/.env.example` con valores de producción
- [x] `handleEmpezarRegistro` en `Calculator.jsx`:
  - POST a `${REACT_APP_API_URL}/api/calculations` con payload completo
  - Redirección a plataforma con `calc_id` devuelto
  - Manejo de errores (alert + reset de loading)
  - Estado `submitting` en botón con `Loader2` spinner
- [x] E2E test passing: POST capturado con payload correcto

## Payload enviado
```json
{
  "califica": true,
  "categorias": [{"code": "M2", "cantidad": 4, "galones_mensuales": 350}],
  "total_galones_mensuales": 1400,
  "subsidio_estimado": 10794.4,
  "detalle": { /* objeto completo del cálculo */ },
  "canal_origen": "calculadora"
}
```

## Backlog
- [ ] Cambiar `REACT_APP_API_URL` en Netlify cuando el backend de la plataforma esté en producción (api.enered.pe o URL de Render)
- [ ] Validación visual del flujo end-to-end con backend real
- [ ] Captura de email/WhatsApp antes del POST (mejora propuesta)
