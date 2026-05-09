# gapsi-ecommerce

Demo de tienda sobre **Next.js** (App Router) y **React** con **TypeScript**.

## Stack

| Área | Tecnología |
|------|------------|
| UI | React 19, **Tailwind CSS** 4 |
| Estado cliente | **Zustand** (carrito, flags de drag/drop) |
| Datos remotos | **TanStack React Query** (caché, estados async) |
| Arrastrar al carrito | **anime.js** `createDraggable` + zona de drop (sin `@dnd-kit` ni react-dnd) |

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

No subas valores reales al repositorio; rota la clave si se filtró.

## Diagrama de capas

Ver [`architecture.mmd`](./architecture.mmd) (Mermaid).
