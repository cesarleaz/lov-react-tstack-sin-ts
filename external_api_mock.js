#!/usr/bin/env node
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4010

app.use(cors())
app.use(express.json({ limit: '20mb' }))

/**
 * Mock API externa para BASE_API_URL
 *
 * Uso recomendado:
 * 1) npm i express cors
 * 2) node external_api_mock.js
 * 3) export VITE_JAAZ_BASE_API_URL=http://localhost:4010
 */

const nowIso = () => new Date().toISOString()
const randomId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const db = {
  deviceCodes: new Map(),
  templates: [],
  knowledge: [
    {
      id: 'kb_1',
      name: 'Guía de marca',
      description: 'Reglas de branding y tono visual.',
      cover: 'https://picsum.photos/seed/kb1/600/300',
      is_public: true,
      content: 'Contenido completo de guía de marca...'
    },
    {
      id: 'kb_2',
      name: 'Producto A',
      description: 'FAQ y características del producto A.',
      cover: 'https://picsum.photos/seed/kb2/600/300',
      is_public: false,
      content: 'Contenido completo de producto A...'
    }
  ],
  users: {
    demo: {
      id: 'u_demo',
      username: 'demo_user',
      image_url: 'https://i.pravatar.cc/120?img=12'
    }
  }
}

function getBearer(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  return auth.slice('Bearer '.length)
}

function requireAuth(req, res, next) {
  const token = getBearer(req)
  const forceStatus = req.query.forceStatus || req.header('x-force-status')

  if (forceStatus) {
    return res.status(Number(forceStatus) || 500).json({
      success: false,
      message: `Forced status ${forceStatus}`
    })
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Missing bearer token'
    })
  }

  if (token === 'expired-token') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  next()
}

app.get('/', (_req, res) => {
  res.json({
    service: 'external-api-mock',
    baseUrl: `http://localhost:${PORT}`,
    tips: [
      'Usa ?scenario=authorized|pending|expired|error en /api/device/poll',
      'Usa ?forceStatus=500 en endpoints auth para simular errores',
      'Usa token "expired-token" para simular 401'
    ]
  })
})

// =========================
// Browser-open endpoints
// =========================
app.get('/billing', (_req, res) => {
  res
    .type('html')
    .send('<h1>Mock Billing Page</h1><p>Esta es una página mock de recarga.</p>')
})

app.get('/auth/device', (req, res) => {
  const { code } = req.query
  res.type('html').send(`
    <h1>Mock Device Auth</h1>
    <p>Código recibido: <b>${code || 'sin código'}</b></p>
    <p>Desde aquí puedes considerar al usuario autorizado en el mock.</p>
  `)
})

// =========================
// Auth endpoints
// =========================
app.post('/api/device/auth', (req, res) => {
  const forceStatus = req.query.forceStatus || req.header('x-force-status')
  if (forceStatus) {
    return res.status(Number(forceStatus) || 500).json({
      status: 'error',
      message: `Forced status ${forceStatus}`
    })
  }

  const code = String(req.query.code || randomId('code')).toUpperCase()
  const expiresInSec = Number(req.query.expiresInSec || 600)
  const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString()

  db.deviceCodes.set(code, {
    status: 'pending',
    created_at: nowIso(),
    expires_at: expiresAt,
    token: `token_${code}`,
    user_info: db.users.demo
  })

  return res.json({
    status: 'pending',
    code,
    expires_at: expiresAt
  })
})

app.get('/api/device/poll', (req, res) => {
  const { code, scenario } = req.query
  const forceStatus = req.query.forceStatus || req.header('x-force-status')

  if (forceStatus) {
    return res.status(Number(forceStatus) || 500).json({
      status: 'error',
      message: `Forced status ${forceStatus}`
    })
  }

  if (!code) {
    return res.status(400).json({ status: 'error', message: 'Missing code' })
  }

  const record = db.deviceCodes.get(code) || {
    status: 'pending',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    token: `token_${code}`,
    user_info: db.users.demo
  }

  const currentScenario = scenario || record.status || 'pending'

  if (currentScenario === 'authorized') {
    record.status = 'authorized'
    db.deviceCodes.set(code, record)
    return res.json({
      status: 'authorized',
      token: record.token,
      user_info: record.user_info
    })
  }

  if (currentScenario === 'expired') {
    return res.json({ status: 'expired' })
  }

  if (currentScenario === 'error') {
    return res.json({ status: 'error', message: 'Mock auth flow error' })
  }

  return res.json({ status: 'pending' })
})

app.get('/api/device/refresh-token', (req, res) => {
  const token = getBearer(req)
  const scenario = req.query.scenario

  if (!token) {
    return res.status(401).json({ message: 'Missing token' })
  }

  if (scenario === 'expired' || token === 'expired-token') {
    return res.status(401).json({ message: 'Token expired' })
  }

  if (scenario === 'server-error') {
    return res.status(500).json({ message: 'Mock server error' })
  }

  return res.status(200).json({
    new_token: `${token}_refreshed_${Date.now()}`
  })
})

// =========================
// Billing
// =========================
app.get('/api/billing/getBalance', requireAuth, (req, res) => {
  const scenario = req.query.scenario

  if (scenario === 'empty') {
    return res.json({})
  }

  if (scenario === 'zero') {
    return res.json({ balance: '0.00' })
  }

  if (scenario === 'low') {
    return res.json({ balance: '0.25' })
  }

  return res.json({
    balance: '12.50',
    currency: 'USD',
    updated_at: nowIso()
  })
})

// =========================
// Template
// =========================
app.post('/api/template/create', requireAuth, (req, res) => {
  const scenario = req.query.scenario

  if (scenario === 'validation-error') {
    return res.status(422).json({
      success: false,
      message: 'Invalid template payload'
    })
  }

  const { name, canvas_id, session_id, cover_image, message, canvas_data } = req.body || {}

  if (!name || !canvas_id || !session_id || !cover_image || !canvas_data) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, canvas_id, session_id, cover_image, canvas_data'
    })
  }

  const template_id = randomId('tpl')
  const template = {
    template_id,
    name,
    canvas_id,
    session_id,
    cover_image,
    message,
    canvas_data,
    created_at: nowIso()
  }

  db.templates.push(template)

  return res.status(200).json({
    success: true,
    template_id,
    share_url: `https://jaaz.app/template/${template_id}`
  })
})

// =========================
// Knowledge
// =========================
app.get('/api/knowledge/list', requireAuth, (req, res) => {
  const pageSize = Math.max(1, Number(req.query.pageSize || 10))
  const pageNumber = Math.max(1, Number(req.query.pageNumber || 1))
  const search = String(req.query.search || '').trim().toLowerCase()
  const scenario = req.query.scenario

  let list = [...db.knowledge]
  if (search) {
    list = list.filter(
      (k) =>
        k.name.toLowerCase().includes(search) ||
        (k.description || '').toLowerCase().includes(search) ||
        (k.content || '').toLowerCase().includes(search)
    )
  }

  if (scenario === 'missing-pagination') {
    return res.json({ data: { list } })
  }

  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (pageNumber - 1) * pageSize
  const paginated = list.slice(start, start + pageSize).map(({ content, ...rest }) => rest)

  return res.json({
    data: {
      list: paginated,
      pagination: {
        page_size: pageSize,
        page_number: pageNumber,
        total_pages: totalPages,
        total
      }
    }
  })
})

app.get('/api/knowledge/:id', requireAuth, (req, res) => {
  const item = db.knowledge.find((k) => k.id === req.params.id)
  if (!item) {
    return res.status(404).json({ success: false, message: 'Knowledge not found' })
  }

  return res.json({ data: item })
})

app.post('/api/knowledge/create', requireAuth, (req, res) => {
  const { name, description = '', cover = '', is_public = false, content = '' } = req.body || {}
  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' })
  }

  const created = {
    id: randomId('kb'),
    name,
    description,
    cover,
    is_public,
    content
  }

  db.knowledge.unshift(created)

  return res.status(201).json({
    success: true,
    message: 'Knowledge created',
    data: created
  })
})

app.put('/api/knowledge/:id', requireAuth, (req, res) => {
  const index = db.knowledge.findIndex((k) => k.id === req.params.id)
  if (index < 0) {
    return res.status(404).json({ success: false, message: 'Knowledge not found' })
  }

  db.knowledge[index] = {
    ...db.knowledge[index],
    ...req.body
  }

  return res.json({
    success: true,
    message: 'Knowledge updated',
    data: db.knowledge[index]
  })
})

app.delete('/api/knowledge/:id', requireAuth, (req, res) => {
  const index = db.knowledge.findIndex((k) => k.id === req.params.id)
  if (index < 0) {
    return res.status(404).json({ success: false, message: 'Knowledge not found' })
  }

  const [removed] = db.knowledge.splice(index, 1)
  return res.json({
    success: true,
    message: 'Knowledge deleted',
    data: { id: removed.id }
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  })
})

app.listen(PORT, () => {
  console.log(`✅ External API mock listening on http://localhost:${PORT}`)
  console.log('Set VITE_JAAZ_BASE_API_URL to this URL in your frontend env.')
})
