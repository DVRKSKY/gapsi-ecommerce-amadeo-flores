# gapsi-ecommerce

Demo de tienda sobre **Next.js** (App Router) y **React** con **TypeScript**.

## Diseño del código

- **Orientado por features**: el dominio está en `src/features/<nombre>/` (servidor, hooks, stores, UI del mismo caso de uso); las rutas viven en `app/` y lo genérico en `src/shared/`.
- **Atomic design**: átomos y layout base en `src/shared/ui/atoms/` (y layouts compartidos); **moléculas / organismos / plantillas** por feature (por ejemplo productos/carrito).
- **PWA ligera**: `app/manifest.ts` expone instalación **`display: "standalone"`**, iconos y métadatos; el layout enlaza `/manifest.webmanifest`. No hay service worker offline en este repo.

## Comportamiento móvil

- Pantallas **debajo del breakpoint `lg`**: el carrito es un **cajón** (cerrado por defecto); se abre/cierra desde el botón **Carrito** del encabezado, el hueco detrás cierra el panel y Esc también. Al **añadir** un producto (botón «Añadir») el cajón se abre solo en ese viewport.
- **Drag al carrito** solo si hay **puntero fino** y **`min-width: 1024px`**; en táctiles o vista estrecha las tarjetas son estáticas (sin anime.js draggable).

## Stack

| Área | Tecnología |
|------|------------|
| UI | React 19, **Tailwind CSS** 4 |
| Estado cliente | **Zustand** (carrito, drawer móvil, flags de drag/drop) |
| Datos remotos | **TanStack React Query** (caché, estados async) |
| Arrastrar al carrito (solo escritorio) | **anime.js** `createDraggable` + zona de drop |

## Scripts

```bash
npm run dev    # desarrollo
npm run build  # producción
npm run start  # servidor tras build
npm run lint
```

## Variables de entorno

Crea `.env.local` en la raíz con estas claves (sin commitear el archivo):

| Variable | Uso |
|----------|-----|
| `RAPIDAPI_KEY` | Clave de RapidAPI (solo servidor) |
| `RAPIDAPI_HOST` | Host del servicio Walmart en RapidAPI |
| `WALMART_API_URL` | URL base de la API |
| `NEXT_PUBLIC_LINKEDIN_URL` | Enlace público (footer / perfil) |