# Informe de ingeniería inversa: uso de `BASE_API_URL`

## 1) Qué significa `BASE_API_URL` en este frontend

En este proyecto, `BASE_API_URL` apunta por defecto a `https://jaaz.app` (o al valor de `VITE_JAAZ_BASE_API_URL`), por lo que todo request con prefijo `BASE_API_URL` sale hacia una API externa, no al backend local (`/api/...`).【F:src/constants.js†L1-L3】

---

## 2) Inventario completo de rutas externas detectadas

### A. Autenticación por dispositivo

1. **POST** `{{BASE_API_URL}}/api/device/auth`
   - Función: `startDeviceAuth()`.
   - Uso frontend:
     - Si `response.ok === false`, lanza error HTTP.
     - Espera JSON con `status`, `code`, `expires_at`.
     - Luego abre navegador en `{{BASE_API_URL}}/auth/device?code=<code>`.【F:src/api/auth.js†L4-L20】

2. **GET** `{{BASE_API_URL}}/auth/device?code=<code>`
   - No se hace `fetch`, se abre con `window.open` para que el usuario autorice login en web externa.【F:src/api/auth.js†L14-L15】

3. **GET** `{{BASE_API_URL}}/api/device/poll?code=<deviceCode>`
   - Función: `pollDeviceAuth(code)`.
   - Uso frontend:
     - Si `response.ok === false`, lanza error HTTP.
     - Espera JSON con al menos `status`.
     - Estados manejados en UI:
       - `authorized`: espera además `token` y `user_info`, guarda sesión.
       - `expired`: muestra expirado y detiene polling.
       - `error`: usa `message` si viene.
       - cualquier otro valor: lo trata como “pending / waiting”.【F:src/api/auth.js†L23-L30】【F:src/components/auth/LoginDialog.jsx†L35-L79】

4. **GET** `{{BASE_API_URL}}/api/device/refresh-token`
   - Función: `refreshToken(currentToken)`.
   - Headers: `Authorization: Bearer <token>`.
   - Contrato esperado por frontend:
     - `200`: JSON `{ new_token }`.
     - `401`: interpreta token realmente expirado (`TOKEN_EXPIRED`) y cierra sesión.
     - otros códigos: tratado como error de red/servidor, pero mantiene sesión actual.【F:src/api/auth.js†L137-L154】【F:src/api/auth.js†L32-L87】

---

### B. Billing

5. **GET** `{{BASE_API_URL}}/api/billing/getBalance`
   - Función: `getBalance()` usando `authenticatedFetch` (Bearer opcional si hay token).
   - Si `!ok`, lanza error.
   - En hooks/UI se espera objeto con `balance`; fallback visual `'0.00'` si falta dato.【F:src/api/billing.js†L3-L11】【F:src/hooks/use-balance.js†L30-L34】

6. **GET** `{{BASE_API_URL}}/billing`
   - No se hace `fetch`; se abre pestaña para recarga de saldo desde menú de usuario y aviso de saldo insuficiente.【F:src/components/auth/UserMenu.jsx†L49-L53】【F:src/components/chat/ChatTextarea.jsx†L62-L71】

---

### C. Templates

7. **POST** `{{BASE_API_URL}}/api/template/create`
   - Uso en `ShareTemplateDialog`.
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer <jaaz_access_token desde localStorage>`
   - Body contiene:
     - `name`, `canvas_id`, `session_id`, `cover_image`, `message`, `canvas_data`.
   - Si `!ok`, muestra toast de error.
   - Si `ok`, parsea JSON (sin exigir schema específico) y muestra success toast.【F:src/components/chat/ShareTemplateDialog.jsx†L79-L118】

---

### D. Knowledge base (externa)

8. **GET** `{{BASE_API_URL}}/api/knowledge/list?pageSize=&pageNumber=&search=`
   - Usa `authenticatedFetch`.
   - Si `!ok`, lanza error.
   - Contrato esperado por UI:
     - `response.data.list` (array)
     - `response.data.pagination.total_pages` (número).【F:src/api/knowledge.js†L8-L30】【F:src/components/knowledge/Knowledge.jsx†L59-L67】

9. **GET** `{{BASE_API_URL}}/api/knowledge/:id`
   - Si `!ok`, error.
   - Retorna `data.data` (el frontend toma esa propiedad exacta).【F:src/api/knowledge.js†L39-L52】

10. **POST** `{{BASE_API_URL}}/api/knowledge/create`
11. **PUT** `{{BASE_API_URL}}/api/knowledge/:id`
12. **DELETE** `{{BASE_API_URL}}/api/knowledge/:id`
   - Las tres rutas validan `response.ok` y retornan `response.json()`.
   - Aunque en este repo no se ve un formulario CRUD completo conectado, el cliente ya está preparado para usarlas.【F:src/api/knowledge.js†L61-L135】

> Nota de frontera local vs externa: en ese mismo archivo existe `saveEnabledKnowledgeDataToSettings()` que **NO** usa `BASE_API_URL`, sino `/api/settings` local, confirmando claramente el límite entre backend local y API externa.【F:src/api/knowledge.js†L132-L160】

---

## 3) Contratos de respuesta esperados por el frontend

## 3.1 Auth

- `POST /api/device/auth` (happy path)
```json
{
  "status": "pending",
  "code": "ABC123",
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```
- `GET /api/device/poll?code=...` (variantes)
  - pending:
```json
{ "status": "pending" }
```
  - authorized:
```json
{
  "status": "authorized",
  "token": "token-value",
  "user_info": {
    "id": "u_1",
    "username": "demo",
    "image_url": "https://example.com/avatar.png"
  }
}
```
  - expired:
```json
{ "status": "expired" }
```
  - error:
```json
{ "status": "error", "message": "mensaje opcional" }
```
- `GET /api/device/refresh-token`
  - 200:
```json
{ "new_token": "token-renovado" }
```
  - 401: sin cuerpo obligatorio para el frontend (solo código).

## 3.2 Billing

- `GET /api/billing/getBalance`
```json
{ "balance": "12.50" }
```

## 3.3 Knowledge

- `GET /api/knowledge/list`
```json
{
  "data": {
    "list": [
      {
        "id": "kb_1",
        "name": "Nombre",
        "description": "Desc",
        "cover": "https://...",
        "is_public": true
      }
    ],
    "pagination": {
      "page_size": 12,
      "page_number": 1,
      "total_pages": 1,
      "total": 1
    }
  }
}
```

- `GET /api/knowledge/:id`
```json
{
  "data": {
    "id": "kb_1",
    "name": "Nombre",
    "content": "contenido completo"
  }
}
```

- `POST/PUT/DELETE /api/knowledge...`
```json
{
  "success": true,
  "message": "ok",
  "data": { "id": "kb_1" }
}
```

## 3.4 Template

- `POST /api/template/create`
```json
{
  "success": true,
  "template_id": "tpl_1",
  "share_url": "https://jaaz.app/template/tpl_1"
}
```

---

## 4) Casos hipotéticos que el frontend contempla (o tolera)

1. **Errores HTTP en cualquier endpoint externo**
   - Casi todas las funciones lanzan error al detectar `!response.ok`; la UI captura y muestra toast/mensaje genérico según pantalla.【F:src/api/auth.js†L9-L11】【F:src/api/knowledge.js†L22-L28】【F:src/api/billing.js†L8-L10】

2. **Token expirado real vs fallo de red durante refresh**
   - Solo `401` en refresh fuerza logout.
   - Otros estados (500, 502, timeout traducido a error) no cierran sesión automáticamente.【F:src/api/auth.js†L54-L87】【F:src/api/auth.js†L144-L154】

3. **Polling con estados no documentados**
   - Cualquier estado distinto de `authorized|expired|error` se considera implícitamente “pendiente”.【F:src/components/auth/LoginDialog.jsx†L69-L77】

4. **Respuesta incompleta de balance**
   - Si no hay `data?.balance`, el hook cae a `'0.00'` para no romper UI.【F:src/hooks/use-balance.js†L30-L34】

5. **Knowledge incompleto en listado**
   - Si falta `content` en item habilitado, intenta `GET /api/knowledge/:id` para completar info antes de guardar settings locales.【F:src/components/knowledge/Knowledge.jsx†L101-L121】

6. **Template create sin contrato rígido**
   - Solo exige `response.ok`; el JSON de éxito no se valida en detalle (por eso el mock puede devolver estructura simple).【F:src/components/chat/ShareTemplateDialog.jsx†L107-L118】

---

## 5) Recomendaciones para mock realista

- Permitir simular estados por query/header (`authorized`, `expired`, `error`, `pending`, `401`, `500`, etc.).
- Devolver cuerpos con exactamente las propiedades consumidas por UI (`data.list`, `data.pagination.total_pages`, `new_token`, `balance`, etc.).
- Incluir endpoints navegables (`/billing`, `/auth/device`) para que `window.open` no falle en pruebas manuales.
- Mantener memoria en proceso (in-memory) para knowledge/templates, suficiente para QA local sin DB.
