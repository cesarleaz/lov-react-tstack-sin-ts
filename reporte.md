# Reporte de migración ejecutada: TanStack Query → Zustand + `fetch` nativo

## Resumen ejecutivo

Se realizó la migración de la capa de server-state que dependía de TanStack Query hacia una implementación basada en **Zustand + `fetch` nativo**, preservando el comportamiento funcional clave (refetch, invalidación, caché temporal, estados de carga/error) y sin introducir cambios visuales en UI.

---

## Cambios implementados

### 1) Eliminación del provider global de React Query

- Se removió de `src/App.jsx`:
  - `QueryClient`
  - `PersistQueryClientProvider`
  - `createAsyncStoragePersister`
  - Inicialización de IndexedDB para caché de React Query

Resultado: la app ahora arranca con `ThemeProvider -> AuthProvider -> ConfigsProvider` sin dependencia de React Query.

### 2) Nuevo estado remoto con Zustand

Se agregaron stores de server-state:

- `src/stores/server/balance.js`
  - Estado: `data`, `status`, `error`, `lastFetchedAt`
  - Funciones: `fetchBalance`, `invalidate`, `clear`, `isStale`
  - TTL equivalente a la query previa (`30s`) + limpieza (`5 min`)

- `src/stores/server/models.js`
  - Estado: `data`, `status`, `error`, `lastFetchedAt`
  - Funciones: `fetchModels`, `invalidate`, `isStale`
  - Mantiene estrategia stale-while-revalidate (no borra data previa durante refresh)

- `src/stores/server/canvases.js`
  - Estado: `data`, `status`, `error`, `lastFetchedAt`
  - Funciones: `fetchCanvases`, `invalidate`, `clear`

### 3) Migración de hooks y componentes que usaban `useQuery`

- `src/hooks/use-balance.js`
  - Reemplazo de `useQuery` por lectura de `useBalanceStore`
  - Conserva:
    - guard por login (`authStatus.is_logged_in`)
    - `refreshBalance`
    - refetch en `window.focus`

- `src/contexts/configs.jsx`
  - Reemplazo de query de modelos/tools por `useModelsStore`
  - Conserva:
    - `refreshModels`
    - refetch en foco y reconexión (`focus`, `online`)
    - lógica existente de selección de modelos/tools y apertura de login

- `src/components/home/CanvasList.jsx`
  - Reemplazo de query de canvases por `useCanvasesStore`
  - Conserva comportamiento de refresco al entrar a Home y tras borrado de canvas

### 4) Migración de mutaciones (`useMutation`) a async nativo

- `src/components/chat/ChatTextarea.jsx`
  - `uploadImage` migrado a callback async con `try/catch`
  - Se preservan toasts y actualización de imágenes en éxito/error

- `src/routes/index.jsx`
  - `createCanvas` migrado a función async nativa con estado local `isPending`
  - Se preserva navegación al canvas creado y toast de error

### 5) Reemplazo de invalidación de query client

- `src/components/chat/Chat.jsx`
  - Se removió `useQueryClient().invalidateQueries(['balance'])`
  - Nuevo flujo al finalizar chat:
    - `invalidateBalance()`
    - `fetchBalance({ force: true })`

### 6) Dependencias

- Se removieron de `package.json`:
  - `@tanstack/query-async-storage-persister`
  - `@tanstack/react-query`
  - `@tanstack/react-query-persist-client`
  - `idb` (ya no se usa en código)

---

## Equivalencia funcional (antes vs después)

- `useQuery(balance)` → `useBalanceStore.fetchBalance()` + TTL + refetch foco
- `useQuery(models/tools)` → `useModelsStore.fetchModels()` + refetch foco/reconexión
- `useQuery(canvases)` → `useCanvasesStore.fetchCanvases({ force: true })`
- `useMutation(upload/createCanvas)` → funciones async con estado local y toasts
- `invalidateQueries(['balance'])` → `invalidateBalance()` + `fetchBalance({ force: true })`

---

## Validación ejecutada

1. Se verificó que no quedan imports ni APIs de React Query en `src/`.
2. Se revisó que los componentes críticos mantengan su flujo de UI (chat, balance, home, canvases).
3. Se comprobó que el archivo `reporte.md` fue actualizado para reflejar **migración ejecutada**, no solo plan.

---

## Incidencias encontradas

- No se pudo regenerar `pnpm-lock.yaml` por restricción de acceso al registry (`403` en este entorno).
- `package.json` sí quedó actualizado; el lockfile debe regenerarse en un entorno con acceso al registry para dejar dependencias sincronizadas.

---

## Conclusión

La migración funcional de TanStack Query a Zustand + `fetch` nativo quedó aplicada en el código fuente principal, manteniendo la UX existente en los flujos críticos. Solo queda pendiente la regeneración del lockfile en un entorno con acceso a paquetes para cerrar la limpieza de dependencias al 100%.
