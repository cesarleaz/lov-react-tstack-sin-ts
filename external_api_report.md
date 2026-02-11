# Informe verificado de `BASE_API_URL` (con schemas de respuesta)

> Este documento está construido **solo** desde consumos reales del frontend.
> Incluye, además, **schemas de respuesta** en formato estructurado para cada endpoint externo usado por `BASE_API_URL`.

## 1) Qué es `BASE_API_URL`

`BASE_API_URL` se define como:

- `import.meta.env.VITE_JAAZ_BASE_API_URL`
- fallback: `https://jaaz.app`

Todo `fetch`/`window.open` con `BASE_API_URL` sale a servicio externo.

---

## 2) Inventario exacto de usos de `BASE_API_URL`

### 2.1 Endpoints HTTP (`fetch`)

1. `POST {BASE_API_URL}/api/device/auth`
2. `GET {BASE_API_URL}/api/device/poll?code=<deviceCode>`
3. `GET {BASE_API_URL}/api/device/refresh-token`
4. `GET {BASE_API_URL}/api/billing/getBalance`
5. `GET {BASE_API_URL}/api/knowledge/list?pageSize=&pageNumber=&search=`
6. `GET {BASE_API_URL}/api/knowledge/:id`
7. `POST {BASE_API_URL}/api/knowledge/create`
8. `PUT {BASE_API_URL}/api/knowledge/:id`
9. `DELETE {BASE_API_URL}/api/knowledge/:id`
10. `POST {BASE_API_URL}/api/template/create`

### 2.2 Rutas abiertas en navegador (`window.open`)

11. `GET {BASE_API_URL}/auth/device?code=<code>`
12. `GET {BASE_API_URL}/billing`

---

## 3) Schemas de respuesta (estilo estructura de API)

> Nota: estos schemas representan lo que el frontend **consume/tolera**. No garantizan contrato oficial del proveedor externo.

## 3.1 Auth por dispositivo

### Endpoint: `POST /api/device/auth`

#### Schema de respuesta mínima esperada

```json
{
  "status": "string",
  "code": "string",
  "expires_at": "string(date-time)"
}
```

#### Ejemplo realista

```json
{
  "status": "pending",
  "code": "ABC123",
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

---

### Endpoint: `GET /api/device/poll?code=...`

#### Schema por estados

**Pending**
```json
{
  "status": "pending"
}
```

**Authorized**
```json
{
  "status": "authorized",
  "token": "string",
  "user_info": {
    "id": "string|number",
    "username": "string",
    "image_url": "string"
  }
}
```

**Expired**
```json
{
  "status": "expired"
}
```

**Error**
```json
{
  "status": "error",
  "message": "string"
}
```

#### Regla frontend

- Lee siempre `status`.
- Si `status === authorized`, consume `token` y `user_info`.
- Si `status === error`, usa `message` opcional.

---

### Endpoint: `GET /api/device/refresh-token`

#### Schema de respuesta en 200

```json
{
  "new_token": "string"
}
```

#### Semántica por HTTP status

- `200`: usa `new_token`
- `401`: token expirado real (logout)
- otro: error de red/servidor (mantiene sesión)

---

## 3.2 Billing

### Endpoint: `GET /api/billing/getBalance`

#### Schema de respuesta mínima consumida

```json
{
  "balance": "string|number"
}
```

#### Schema extendido tolerado (opcional)

```json
{
  "balance": "string|number",
  "currency": "string",
  "updated_at": "string(date-time)"
}
```

#### Regla frontend

- Solo usa `balance`.
- Si no llega, aplica fallback `'0.00'`.

---

## 3.3 Templates

### Endpoint: `POST /api/template/create`

#### Request body que envía frontend

```json
{
  "name": "string",
  "canvas_id": "string|number",
  "session_id": "string|number",
  "cover_image": "string(dataURL)",
  "message": "any",
  "canvas_data": {
    "elements": "array",
    "appState": "object",
    "files": "object"
  }
}
```

#### Schema de respuesta mínima para éxito en frontend

```json
{
  "<any_key>": "any_value"
}
```

#### Ejemplo recomendado

```json
{
  "success": true,
  "template_id": "tpl_1",
  "share_url": "https://jaaz.app/template/tpl_1"
}
```

#### Regla frontend

- Solo valida `response.ok`.
- No usa campos concretos del JSON de éxito.

---

## 3.4 Knowledge

### Endpoint: `GET /api/knowledge/list`

#### Schema de respuesta mínima esperada por UI

```json
{
  "data": {
    "list": [
      {
        "id": "string|number",
        "name": "string?",
        "description": "string?",
        "cover": "string?",
        "is_public": "boolean?",
        "content": "string?"
      }
    ],
    "pagination": {
      "total_pages": "number"
    }
  }
}
```

#### Ejemplo realista

```json
{
  "data": {
    "list": [
      {
        "id": "kb_1",
        "name": "Brand guide",
        "description": "Reglas de marca",
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

---

### Endpoint: `GET /api/knowledge/:id`

#### Schema de respuesta mínima consumida

```json
{
  "data": {
    "id": "string|number"
  }
}
```

#### Schema común esperado

```json
{
  "data": {
    "id": "string|number",
    "name": "string",
    "description": "string",
    "cover": "string",
    "is_public": "boolean",
    "content": "string"
  }
}
```

---

### Endpoints de mutación

- `POST /api/knowledge/create`
- `PUT /api/knowledge/:id`
- `DELETE /api/knowledge/:id`

#### Schema de respuesta tolerado por wrapper frontend

```json
{
  "success": "boolean?",
  "message": "string?",
  "data": "object?"
}
```

#### Regla frontend

- Si `response.ok` es true => hace `response.json()` y retorna.
- No hay validación de shape estricto en el código mostrado.

---

## 4) Matriz rápida (endpoint -> campos mínimos)

| Endpoint | Campos mínimos que debe devolver |
|---|---|
| `POST /api/device/auth` | `status`, `code`, `expires_at` |
| `GET /api/device/poll` | `status` (y para autorizado: `token`, `user_info`) |
| `GET /api/device/refresh-token` | `new_token` en 200 |
| `GET /api/billing/getBalance` | `balance` |
| `POST /api/template/create` | cualquier JSON si responde 2xx |
| `GET /api/knowledge/list` | `data.list`, `data.pagination.total_pages` |
| `GET /api/knowledge/:id` | `data` |
| mutaciones knowledge | cualquier JSON en 2xx |

---

## 5) Lo no verificable (evita inventar)

1. No hay en este repo un OpenAPI/Swagger oficial de la API externa.
2. No está verificado un endpoint raíz real `GET {BASE_API_URL}/` con índice de recursos.
3. Campos como `currency`, `updated_at`, `success`, `message` pueden existir, pero no son obligatorios para todos los flujos frontend.

---

## 6) Frontera con backend local

El mismo frontend también usa rutas locales (sin `BASE_API_URL`), por ejemplo `GET/POST /api/settings`; esas no forman parte de esta API externa.
