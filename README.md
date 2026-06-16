# Calculadora de Subsidio Enered · DU 004-2026

Calculadora web para estimar la devolución del subsidio del Estado (Decreto de Urgencia 004-2026) por el consumo de diésel B5/B20 del transporte regular de personas y de mercancías en Perú.

## Stack
- React 18 + Create React App
- Tailwind CSS 3.4
- React Router 6
- Lucide React (iconos)
- Tipografías: Cabinet Grotesk + Manrope (Fontshare CDN)

## Estructura del proyecto

```
.
├── public/
│   ├── index.html
│   ├── favicon.png
│   └── assets/
│       └── enered-logo.png
├── src/
│   ├── index.js              # entry point
│   ├── index.css             # estilos globales + tailwind + fuentes
│   ├── App.js                # router
│   ├── lib/
│   │   └── calculatorData.js # datos del decreto + lógica de cálculo y elegibilidad
│   └── pages/
│       └── Calculator.jsx    # calculadora completa (4 etapas)
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── .gitignore
```

## Instalación local

```bash
yarn install        # o npm install
yarn start          # arranca en http://localhost:3000
```

Para build de producción:
```bash
yarn build
```

## Configuración del cálculo

Todos los valores del decreto están centralizados en `src/lib/calculatorData.js`:

- `SUBSIDIO_GL = 4.00`  → S/ por galón
- `MESES = 2`           → período (junio y julio 2026)
- `VEHICLE_CATEGORIES`  → topes por categoría M2/M3/N1/N2/N3
- `ELIGIBILITY_QUESTIONS` → preguntas del flujo de elegibilidad
- `evaluateEligibility()` → reglas de calificación
- `calculateSubsidy()`  → motor de cálculo con tope por unidad

Si cambia el decreto, edita ese único archivo.

## Despliegue

Compatible con Vercel, Netlify, Render, etc. Build command: `yarn build`. Publish directory: `build/`.

## Roadmap

- [ ] Backend (FastAPI + MongoDB) para guardar leads y cálculos
- [ ] Captura de email/WhatsApp antes de mostrar el resultado final
- [ ] Panel admin para gestionar leads
- [ ] Export PDF del estimado
