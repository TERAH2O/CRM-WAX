<div align="center">
  <img src="./src/assets/logo-wax.png" alt="Wax CRM" width="160" />

  <h1>Wax · Studio CRM</h1>

  <p><strong>Sistema de gestión completo para negocios de depilación y estética.</strong></p>
  <p>Clientas, agenda, servicios, historial y finanzas — en un solo lugar, con persistencia local y cero suscripción.</p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" />
    <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/License-MIT-c85a3e" />
  </p>
</div>

---

## ✨ ¿Qué resuelve este proyecto?

La mayoría de los negocios de depilación siguen gestionando su agenda con cuadernos, notas sueltas, grupos de WhatsApp y memoria. **Eso cuesta dinero**: citas olvidadas, clientas que no vuelven, precios inconsistentes, gastos sin registrar.

**Wax** reemplaza todo eso con una app web simple, bonita y rápida que:

- 📅 Organiza tus citas con vistas de hoy, mañana y semana.
- 👥 Mantiene fichas completas de cada clienta (piel, dolor, notas, cumpleaños).
- 💅 Estandariza precios y servicios.
- 📜 Guarda el historial de cada visita y sugiere automáticamente la próxima cita.
- 📞 Detecta clientas que deberían estar regresando y te genera el mensaje de reactivación listo para WhatsApp.
- 💰 Controla ingresos y gastos reales, con margen y gasto por categoría.

Todo corre en tu navegador. Tus datos se guardan en `localStorage` — **no se envían a ningún servidor**.

---

## 🎨 Filosofía de diseño

Diseñado como una herramienta profesional, no un dashboard genérico: tipografía editorial (Fraunces), paleta cálida en tonos crema, coral y ámbar inspirada en la identidad de la marca, y densidad de información ajustada para que lo uses rápido sin saturarte.

---

## 🗄️ Arquitectura

Cinco bases de datos interconectadas que se actualizan entre sí automáticamente:

```
                    ┌──────────────┐
                    │   CLIENTAS   │
                    └───────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  AGENDA  │  │HISTORIAL │  │ FINANZAS │
        └─────┬────┘  └─────┬────┘  └──────────┘
              │             │
              └──────┬──────┘
                     ▼
              ┌──────────────┐
              │  SERVICIOS   │
              └──────────────┘
```

**Principio clave:** AGENDA es el futuro, HISTORIAL es el pasado. Cuando marcas una cita como "Completada", el sistema automáticamente crea el registro de Historial y la entrada de Ingreso en Finanzas. Un solo clic dispara tres actualizaciones.

---

## 🔑 Funcionalidades

### Dashboard de inicio
- Citas del día con hora y servicio.
- Clientas pendientes de reagendar (según frecuencia de su servicio).
- Ingresos y ganancia del mes en curso.
- Cumpleañeras del mes.

### Clientas
- Fichas con teléfono, cumpleaños, tipo de piel, nivel de dolor habitual, notas privadas.
- Sistema automático de nivel VIP por gasto acumulado (💎 Diamante / 🥇 Oro / 🥈 Plata).
- Estado automático: Activa / Inactiva / Nueva según última visita.
- Vistas: VIP, Inactivas, Cumples del mes, Nuevas, Todas.
- Referidas (auto-relación para trackear red de boca a boca).

### Agenda
- Vistas Hoy / Mañana / Próximos 7 días / Por confirmar / Todas.
- Cambio de estado rápido (Pendiente → Confirmada → Completada).
- Múltiples servicios por cita (con cálculo automático de duración y precio).
- Al completar una cita: se crea automáticamente el registro en Historial y el ingreso en Finanzas.

### Servicios
- Tabla ordenada por rentabilidad: ingresos generados y precio por minuto.
- Popularidad automática según veces realizado.
- Campos clave: precio, duración, frecuencia recomendada, nivel de dolor típico.

### Historial ⭐
- **Vista "🟡 Para contactar ya"**: detecta automáticamente clientas cuya próxima cita debería haber sucedido y genera el mensaje de reactivación personalizado (copiable al portapapeles con un clic).
- **Vista "🔴 En riesgo"**: clientas perdidas que requieren intervención especial.
- Observaciones, nivel de dolor reportado, método de pago por cada visita.
- Fórmula de próxima cita sugerida automática (fecha + frecuencia del servicio).

### Finanzas
- Ingresos vs gastos del mes en curso, ganancia neta y margen.
- Gastos por categoría con barras visuales.
- Vistas: Este mes, Solo ingresos, Solo gastos, Gastos recurrentes, Todo.
- Los ingresos se auto-registran al completar citas.

---

## 🚀 Instalación

### Requisitos
- Node.js 18+ ([descargar](https://nodejs.org))
- Un navegador moderno (Chrome, Firefox, Safari, Edge)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/wax-crm.git
cd wax-crm

# 2. Instala las dependencias
npm install

# 3. Arranca en modo desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador. La app se carga con datos de ejemplo para que veas todo funcionando desde el primer segundo.

### Para producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`. Puedes subirlos a cualquier servicio de hosting estático gratuito: **Vercel**, **Netlify**, **GitHub Pages**, **Cloudflare Pages**.

### Vista previa del build

```bash
npm run preview
```

---

## 📁 Estructura del proyecto

```
wax-crm/
├── public/                    # Archivos estáticos servidos tal cual
├── src/
│   ├── assets/
│   │   └── logo-wax.png       # Logo de la marca
│   ├── App.jsx                # Componente raíz con toda la lógica
│   ├── main.jsx               # Entry point de React
│   └── index.css              # Tailwind + variables de tema
├── index.html                 # HTML base con fuentes Google
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🎨 Personalización

### Cambiar la paleta de colores

Edita las variables CSS en `src/index.css`:

```css
:root {
  --rose-deep: #C85A3E;    /* coral principal (botones, links, nav activa) */
  --gold-deep: #C08530;    /* ámbar (badges VIP) */
  --sage-deep: #4A5A3E;    /* verde de estados "Activa/Al día" */
  /* ... */
}
```

### Cambiar el logo

Reemplaza `src/assets/logo-wax.png` con tu propio archivo PNG (idealmente con fondo transparente, proporción horizontal).

### Cambiar los datos de ejemplo

Edita la función `seedData()` en `src/App.jsx` para pre-cargar servicios, clientas y visitas personalizadas del lanzamiento.

### Cambiar el almacenamiento

Por defecto usa `localStorage` (se guarda en el navegador). Si quieres sincronizar entre dispositivos, puedes reemplazar las dos llamadas a `localStorage.getItem` / `localStorage.setItem` por fetch contra tu backend preferido (Firebase, Supabase, PocketBase, etc).

---

## 💾 Sobre los datos

- Todo se guarda en `localStorage` del navegador bajo la clave `depila_crm_state_v1`.
- **Ventajas:** cero infraestructura, privacidad total, funciona sin internet.
- **Limitación:** los datos viven en un solo navegador / dispositivo. Para uso multi-dispositivo, ver la sección de personalización de almacenamiento arriba.
- **Botón "reiniciar demo"** en la esquina superior derecha: restaura los datos de ejemplo.

---

## 🧰 Stack técnico

- **[React 18](https://react.dev)** — UI con hooks.
- **[Vite](https://vitejs.dev)** — bundler ultrarrápido.
- **[Tailwind CSS 3](https://tailwindcss.com)** — estilos utility-first.
- **[Lucide](https://lucide.dev)** — iconos.
- **[Fraunces](https://fonts.google.com/specimen/Fraunces)** + **[Figtree](https://fonts.google.com/specimen/Figtree)** — tipografías (Google Fonts).

Sin backend. Sin base de datos remota. Sin dependencias pesadas.

---

## 📸 Capturas

> _Agrega capturas de tu instancia corriendo aquí después del primer deploy._

---

## 🤝 Contribuir

Pull requests bienvenidos. Para cambios grandes, abre un issue primero para discutir qué te gustaría modificar.

---

## 📄 Licencia

[MIT](./LICENSE) — libre para usar, modificar y distribuir.

---

<div align="center">
  <sub>Hecho con cuidado en cada detalle · diseñado para crecer contigo.</sub>
</div>
