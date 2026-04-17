import type { Architecture } from '#/data/types'
import { ARCHITECTURES_MAP } from '#/data/architectures'
import { SERVICES } from '#/data/services'

// -- Binding metadata per service ID --
const BINDING_MAP: Record<string, { type: string; binding: string; comment: string; toml: string }> = {
  workers: { type: '', binding: '', comment: '', toml: '' }, // workers is the runtime, no binding needed
  durableObjects: {
    type: 'DurableObjectNamespace',
    binding: 'SESSION',
    comment: 'Durable Object para estado persistente por entidad',
    toml: `[[durable_objects.bindings]]
name = "SESSION"
class_name = "SessionDO"

[[migrations]]
tag = "v1"
new_classes = ["SessionDO"]`,
  },
  d1: {
    type: 'D1Database',
    binding: 'DB',
    comment: 'SQLite distribuido en el edge',
    toml: `[[d1_databases]]
binding = "DB"
database_name = "main-db"
database_id = "<YOUR_D1_DATABASE_ID>"`,
  },
  kv: {
    type: 'KVNamespace',
    binding: 'KV',
    comment: 'Key-value global con eventual consistency',
    toml: `[[kv_namespaces]]
binding = "KV"
id = "<YOUR_KV_NAMESPACE_ID>"`,
  },
  r2: {
    type: 'R2Bucket',
    binding: 'BUCKET',
    comment: 'Object storage S3-compatible, $0 egress',
    toml: `[[r2_buckets]]
binding = "BUCKET"
bucket_name = "main-bucket"`,
  },
  queues: {
    type: 'Queue',
    binding: 'QUEUE',
    comment: 'Cola de mensajes at-least-once',
    toml: `[[queues.producers]]
binding = "QUEUE"
queue = "main-queue"

[[queues.consumers]]
queue = "main-queue"
max_batch_size = 100
max_batch_timeout = 30`,
  },
  workflows: {
    type: 'Workflow',
    binding: 'WORKFLOW',
    comment: 'Ejecucion durable multi-paso con retries y sleep',
    toml: `[[workflows]]
binding = "WORKFLOW"
name = "main-workflow"
class_name = "MainWorkflow"`,
  },
  vectorize: {
    type: 'VectorizeIndex',
    binding: 'VECTORIZE',
    comment: 'Vector DB para memoria semantica y RAG',
    toml: `[[vectorize]]
binding = "VECTORIZE"
index_name = "main-index"`,
  },
  workersAI: {
    type: 'Ai',
    binding: 'AI',
    comment: 'Inferencia de modelos open-source en GPUs de CF',
    toml: `[ai]
binding = "AI"`,
  },
  aiGateway: {
    type: 'string', // gateway ID stored as var
    binding: 'AI_GATEWAY_ID',
    comment: 'Proxy unificado para LLM providers con cache y guardrails',
    toml: `[vars]
AI_GATEWAY_ID = "eigen-gateway"`,
  },
  aiSearch: {
    type: 'Fetcher',
    binding: 'AI_SEARCH',
    comment: 'Busqueda managed con hybrid retrieval (BM25 + vector)',
    toml: `# AI Search se configura via dashboard y se accede via REST API
# Usa AI_GATEWAY_ID para routing
[vars]
AI_SEARCH_INDEX = "main-search"`,
  },
  access: {
    type: '', binding: '', comment: '',
    toml: `# Access se configura en el dashboard de Cloudflare
# El Worker valida Cf-Access-JWT-Assertion headers`,
  },
  tunnel: {
    type: '', binding: '', comment: '',
    toml: `# Tunnel se configura via cloudflared CLI
# cloudflared tunnel create eigen-tunnel`,
  },
  agentsSDK: {
    type: 'DurableObjectNamespace',
    binding: 'AGENT',
    comment: 'Agente long-running con persistencia y sub-agents',
    toml: `[[durable_objects.bindings]]
name = "AGENT"
class_name = "AgentDO"`,
  },
  emailService: {
    type: 'SendEmail',
    binding: 'EMAIL',
    comment: 'Email transaccional (envio) + routing (recepcion)',
    toml: `# Email Routing se configura en dashboard
# Email Sending (beta) via bindings
[vars]
EMAIL_DOMAIN = "eigen.dev"`,
  },
  artifacts: {
    type: 'Fetcher',
    binding: 'ARTIFACTS',
    comment: 'Git-compatible versioned storage para agentes',
    toml: `# Artifacts se accede via REST API / Git protocol`,
  },
  browserRun: {
    type: 'BrowserWorker',
    binding: 'BROWSER',
    comment: 'Chrome headless en edge con HITL y recordings',
    toml: `[browser]
binding = "BROWSER"`,
  },
  pages: {
    type: '', binding: '', comment: '',
    toml: `# Pages se deploya por separado (wrangler pages deploy)
# O integrado via Functions en /functions/`,
  },
  hyperdrive: {
    type: 'Hyperdrive',
    binding: 'HYPERDRIVE',
    comment: 'Connection pool para Postgres externo',
    toml: `[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<YOUR_HYPERDRIVE_CONFIG_ID>"`,
  },
  analyticsEngine: {
    type: 'AnalyticsEngineDataset',
    binding: 'ANALYTICS',
    comment: 'Time-series DB para eventos de alto volumen',
    toml: `[[analytics_engine_datasets]]
binding = "ANALYTICS"`,
  },
  workersCalls: {
    type: 'Fetcher',
    binding: 'CALLS',
    comment: 'WebRTC SFU para audio/video en tiempo real',
    toml: `# Workers Calls se configura via dashboard
# El Worker interactua via REST API de Calls
[vars]
CALLS_APP_ID = "<YOUR_CALLS_APP_ID>"`,
  },
}

/**
 * Generates a realistic wrangler.toml for the given architecture
 */
export function generateWranglerToml(arch: Architecture): string {
  const lines: string[] = []

  lines.push(`# wrangler.toml — ${arch.name}`)
  lines.push(`# ${arch.desc}`)
  lines.push(``)
  lines.push(`name = "${arch.id}"`)
  lines.push(`main = "src/index.ts"`)
  lines.push(`compatibility_date = "2025-04-01"`)
  lines.push(`compatibility_flags = ["nodejs_compat"]`)

  // Check if architecture uses scheduled (cron triggers)
  const usesCron = arch.flow.toLowerCase().includes('cron') ||
    arch.flow.toLowerCase().includes('scheduled') ||
    arch.steps.some(s => s.toLowerCase().includes('cron') || s.toLowerCase().includes('scheduled'))

  if (usesCron) {
    lines.push(``)
    lines.push(`# Cron triggers para tareas programadas`)
    lines.push(`[triggers]`)
    lines.push(`crons = ["0 * * * *"]  # Cada hora`)
  }

  // Collect bindings from services
  const vars: string[] = []
  const bindingSections: string[] = []

  for (const svcId of arch.services) {
    const meta = BINDING_MAP[svcId]
    if (!meta || !meta.toml) continue

    // Collect [vars] entries separately to merge them
    if (meta.toml.includes('[vars]')) {
      const varLines = meta.toml.split('\n').filter(l => !l.startsWith('[vars]') && !l.startsWith('#') && l.trim())
      vars.push(...varLines)
      // Also include comments
      const comments = meta.toml.split('\n').filter(l => l.startsWith('#'))
      if (comments.length) {
        bindingSections.push(comments.join('\n'))
      }
    } else {
      const svcName = SERVICES[svcId]?.name ?? svcId
      bindingSections.push(`# ${svcName} — ${meta.comment}\n${meta.toml}`)
    }
  }

  // Output binding sections
  for (const section of bindingSections) {
    lines.push(``)
    lines.push(section)
  }

  // Merge all vars
  if (vars.length > 0) {
    lines.push(``)
    lines.push(`[vars]`)
    for (const v of vars) {
      lines.push(v)
    }
  }

  lines.push(``)
  return lines.join('\n')
}

/**
 * Generates a starter TypeScript Worker entry point for the given architecture
 */
export function generateStarterCode(arch: Architecture): string {
  const lines: string[] = []

  lines.push(`// ${arch.name}`)
  lines.push(`// ${arch.desc}`)
  lines.push(``)

  // Collect bindings for Env interface
  const envBindings: { name: string; type: string; comment: string }[] = []

  for (const svcId of arch.services) {
    const meta = BINDING_MAP[svcId]
    if (!meta || !meta.binding || !meta.type) continue
    envBindings.push({ name: meta.binding, type: meta.type, comment: meta.comment })
  }

  // Env interface
  lines.push(`export interface Env {`)
  if (envBindings.length === 0) {
    lines.push(`  // No custom bindings — pure compute`)
  }
  for (const b of envBindings) {
    lines.push(`  /** ${b.comment} */`)
    lines.push(`  ${b.name}: ${b.type}`)
  }
  lines.push(`}`)
  lines.push(``)

  // Determine handler types from flow/steps
  const hasQueue = arch.services.includes('queues')
  const hasEmail = arch.services.includes('emailService')
  const hasCron = arch.flow.toLowerCase().includes('cron') ||
    arch.flow.toLowerCase().includes('scheduled') ||
    arch.steps.some(s => s.toLowerCase().includes('cron'))

  // Primary fetch handler
  lines.push(`export default {`)
  lines.push(`  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {`)
  lines.push(`    const url = new URL(request.url)`)
  lines.push(``)

  // Generate routing based on architecture type
  const routes = generateRoutes(arch)
  for (const route of routes) {
    lines.push(`    ${route}`)
  }

  lines.push(``)
  lines.push(`    return new Response("Not Found", { status: 404 })`)
  lines.push(`  },`)

  if (hasQueue) {
    lines.push(``)
    lines.push(`  async queue(batch: MessageBatch, env: Env): Promise<void> {`)
    lines.push(`    for (const msg of batch.messages) {`)
    lines.push(`      try {`)
    lines.push(`        // TODO: procesar mensaje`)
    lines.push(`        const payload = msg.body as Record<string, unknown>`)
    lines.push(`        console.log("Processing:", payload)`)
    lines.push(`        msg.ack()`)
    lines.push(`      } catch (err) {`)
    lines.push(`        msg.retry()`)
    lines.push(`      }`)
    lines.push(`    }`)
    lines.push(`  },`)
  }

  if (hasCron) {
    lines.push(``)
    lines.push(`  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {`)
    lines.push(`    // TODO: tarea programada`)
    lines.push(`    console.log("Cron trigger:", event.cron)`)
    lines.push(`  },`)
  }

  if (hasEmail) {
    lines.push(``)
    lines.push(`  async email(message: EmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {`)
    lines.push(`    // TODO: procesar email entrante`)
    lines.push(`    const { from, to, headers } = message`)
    lines.push(`    console.log(\`Email from \${from} to \${to}\`)`)
    lines.push(`  },`)
  }

  lines.push(`}`)

  // Add DO class stubs if needed
  if (arch.services.includes('durableObjects') || arch.services.includes('agentsSDK')) {
    lines.push(``)
    lines.push(`// -- Durable Object --`)
    lines.push(`export class SessionDO implements DurableObject {`)
    lines.push(`  private state: DurableObjectState`)
    lines.push(`  private env: Env`)
    lines.push(``)
    lines.push(`  constructor(state: DurableObjectState, env: Env) {`)
    lines.push(`    this.state = state`)
    lines.push(`    this.env = env`)
    lines.push(`  }`)
    lines.push(``)
    lines.push(`  async fetch(request: Request): Promise<Response> {`)
    lines.push(`    // TODO: manejar requests al DO`)
    lines.push(`    return new Response("OK")`)
    lines.push(`  }`)
    lines.push(`}`)
  }

  if (arch.services.includes('workflows')) {
    lines.push(``)
    lines.push(`// -- Workflow --`)
    lines.push(`export class MainWorkflow {`)
    lines.push(`  async run(event: any, step: any): Promise<void> {`)
    lines.push(`    await step.do("step-1", async () => {`)
    lines.push(`      // TODO: primer paso`)
    lines.push(`    })`)
    lines.push(``)
    lines.push(`    await step.sleep("wait", "1 hour")`)
    lines.push(``)
    lines.push(`    await step.do("step-2", async () => {`)
    lines.push(`      // TODO: segundo paso`)
    lines.push(`    })`)
    lines.push(`  }`)
    lines.push(`}`)
  }

  lines.push(``)
  return lines.join('\n')
}

/** Generate route stubs based on architecture type */
function generateRoutes(arch: Architecture): string[] {
  const routes: string[] = []
  const id = arch.id

  switch (id) {
    case 'whatsapp-agent':
      routes.push(`// Webhook verification (GET)`)
      routes.push(`if (url.pathname === "/webhook" && request.method === "GET") {`)
      routes.push(`  const token = url.searchParams.get("hub.verify_token")`)
      routes.push(`  if (token === "VERIFY_TOKEN") {`)
      routes.push(`    return new Response(url.searchParams.get("hub.challenge") ?? "")`)
      routes.push(`  }`)
      routes.push(`  return new Response("Forbidden", { status: 403 })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Message processing (POST)`)
      routes.push(`if (url.pathname === "/webhook" && request.method === "POST") {`)
      routes.push(`  // TODO: HMAC verification, DO hydrate, AI Gateway call`)
      routes.push(`  const id = env.SESSION.idFromName("conversation-id")`)
      routes.push(`  const stub = env.SESSION.get(id)`)
      routes.push(`  return stub.fetch(request)`)
      routes.push(`}`)
      break

    case 'multi-tenant':
      routes.push(`// Resolve tenant from hostname`)
      routes.push(`const hostname = url.hostname // acme.eigen.dev`)
      routes.push(`const tenantId = hostname.split(".")[0]`)
      routes.push(``)
      routes.push(`// Route to tenant-isolated DO`)
      routes.push(`const id = env.SESSION.idFromName(tenantId)`)
      routes.push(`const stub = env.SESSION.get(id)`)
      routes.push(`return stub.fetch(request)`)
      break

    case 'analytics':
      routes.push(`// Ingest events`)
      routes.push(`if (url.pathname === "/events" && request.method === "POST") {`)
      routes.push(`  const events = await request.json()`)
      routes.push(`  await env.QUEUE.send(events)`)
      routes.push(`  return new Response("OK", { status: 202 })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Dashboard queries`)
      routes.push(`if (url.pathname === "/dashboard") {`)
      routes.push(`  // TODO: query Analytics Engine, return HTML`)
      routes.push(`  return new Response("<html>Dashboard</html>", {`)
      routes.push(`    headers: { "Content-Type": "text/html" },`)
      routes.push(`  })`)
      routes.push(`}`)
      break

    case 'payments':
      routes.push(`// Stripe webhook`)
      routes.push(`if (url.pathname === "/webhook" && request.method === "POST") {`)
      routes.push(`  // TODO: verify Stripe HMAC signature`)
      routes.push(`  const event = await request.json() as { id: string; type: string }`)
      routes.push(`  await env.QUEUE.send({ eventId: event.id, type: event.type })`)
      routes.push(`  return new Response("OK", { status: 200 })`)
      routes.push(`}`)
      break

    case 'rag':
      routes.push(`// Chat endpoint`)
      routes.push(`if (url.pathname === "/chat" && request.method === "POST") {`)
      routes.push(`  const { question } = await request.json() as { question: string }`)
      routes.push(`  // TODO: AI Search hybrid retrieval -> rerank -> Claude`)
      routes.push(`  return Response.json({ answer: "...", citations: [] })`)
      routes.push(`}`)
      break

    case 'email-intake':
      routes.push(`// Health check`)
      routes.push(`if (url.pathname === "/health") {`)
      routes.push(`  return new Response("OK")`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Email processing is handled by the email() handler below`)
      break

    case 'voice':
    case 'voice-realtime':
      routes.push(`// WebRTC signaling`)
      routes.push(`if (url.pathname === "/session" && request.method === "POST") {`)
      routes.push(`  // TODO: crear sesion de Workers Calls, devolver SDP offer`)
      routes.push(`  return Response.json({ sessionId: "...", sdp: "..." })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Audio pipeline status`)
      routes.push(`if (url.pathname === "/status") {`)
      routes.push(`  return Response.json({ active: true })`)
      routes.push(`}`)
      break

    case 'zero-trust':
      routes.push(`// Validate Cf-Access-JWT-Assertion header`)
      routes.push(`const jwt = request.headers.get("Cf-Access-JWT-Assertion")`)
      routes.push(`if (!jwt) return new Response("Unauthorized", { status: 401 })`)
      routes.push(``)
      routes.push(`// TODO: verify JWT, extract email/groups, role-based authz`)
      routes.push(`if (url.pathname.startsWith("/api/")) {`)
      routes.push(`  // Route to backend via Hyperdrive`)
      routes.push(`  return new Response("API response")`)
      routes.push(`}`)
      break

    case 'streaming-llm':
      routes.push(`// SSE streaming endpoint`)
      routes.push(`if (url.pathname === "/stream" && request.method === "POST") {`)
      routes.push(`  const { prompt } = await request.json() as { prompt: string }`)
      routes.push(`  // TODO: Claude stream:true -> ReadableStream -> TransformStream -> SSE`)
      routes.push(`  const stream = new ReadableStream({`)
      routes.push(`    async start(controller) {`)
      routes.push(`      controller.enqueue(new TextEncoder().encode("data: hello\\n\\n"))`)
      routes.push(`      controller.close()`)
      routes.push(`    }`)
      routes.push(`  })`)
      routes.push(`  return new Response(stream, {`)
      routes.push(`    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },`)
      routes.push(`  })`)
      routes.push(`}`)
      break

    case 'multi-region':
      routes.push(`// Read from local D1 replica first, fallback to Postgres via Hyperdrive`)
      routes.push(`if (url.pathname.startsWith("/api/")) {`)
      routes.push(`  try {`)
      routes.push(`    const result = await env.DB.prepare("SELECT * FROM data WHERE id = ?").bind("1").first()`)
      routes.push(`    if (result) return Response.json(result)`)
      routes.push(`  } catch { /* D1 miss, fall through */ }`)
      routes.push(`  // TODO: Hyperdrive -> Postgres fallback`)
      routes.push(`  return Response.json({ source: "postgres" })`)
      routes.push(`}`)
      break

    case 'crdt-collaboration':
      routes.push(`// WebSocket upgrade for collaboration`)
      routes.push(`if (request.headers.get("Upgrade") === "websocket") {`)
      routes.push(`  const docId = url.searchParams.get("doc") ?? "default"`)
      routes.push(`  const id = env.SESSION.idFromName(docId)`)
      routes.push(`  const stub = env.SESSION.get(id)`)
      routes.push(`  return stub.fetch(request)`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// REST API for document snapshots`)
      routes.push(`if (url.pathname.startsWith("/docs/")) {`)
      routes.push(`  // TODO: leer snapshot de R2`)
      routes.push(`  return Response.json({ doc: "..." })`)
      routes.push(`}`)
      break

    case 'feature-flags':
      routes.push(`// Evaluate feature flags`)
      routes.push(`if (url.pathname === "/flags" && request.method === "POST") {`)
      routes.push(`  const { userId } = await request.json() as { userId: string }`)
      routes.push(`  const flags = await env.KV.get("flags", "json") as Record<string, any> | null`)
      routes.push(`  // TODO: hash(userId) -> bucket -> evaluate flags`)
      routes.push(`  return Response.json({ flags: flags ?? {} })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Admin: update flags`)
      routes.push(`if (url.pathname === "/flags" && request.method === "PUT") {`)
      routes.push(`  const newFlags = await request.json()`)
      routes.push(`  await env.KV.put("flags", JSON.stringify(newFlags))`)
      routes.push(`  return new Response("Updated", { status: 200 })`)
      routes.push(`}`)
      break

    case 'webhook-fanout':
      routes.push(`// Receive webhook event`)
      routes.push(`if (url.pathname === "/events" && request.method === "POST") {`)
      routes.push(`  const event = await request.json() as { type: string; id: string }`)
      routes.push(`  // Fan-out: enviar a cola por tipo`)
      routes.push(`  await env.QUEUE.send({ ...event, timestamp: Date.now() })`)
      routes.push(`  return new Response("Accepted", { status: 202 })`)
      routes.push(`}`)
      break

    case 'api-aggregator':
      routes.push(`// API Gateway with rate limiting`)
      routes.push(`if (url.pathname.startsWith("/v1/")) {`)
      routes.push(`  const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "")`)
      routes.push(`  if (!apiKey) return new Response("Unauthorized", { status: 401 })`)
      routes.push(``)
      routes.push(`  // Check quota in DO`)
      routes.push(`  const id = env.SESSION.idFromName(apiKey)`)
      routes.push(`  const stub = env.SESSION.get(id)`)
      routes.push(`  return stub.fetch(request)`)
      routes.push(`}`)
      break

    case 'content-moderation':
      routes.push(`// Upload content for moderation`)
      routes.push(`if (url.pathname === "/upload" && request.method === "POST") {`)
      routes.push(`  const key = \`uploads/\${Date.now()}\``)
      routes.push(`  await env.BUCKET.put(key, request.body)`)
      routes.push(`  // TODO: trigger Workers AI moderation pipeline`)
      routes.push(`  return Response.json({ key, status: "processing" })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Check moderation status`)
      routes.push(`if (url.pathname.startsWith("/status/")) {`)
      routes.push(`  return Response.json({ status: "approved" })`)
      routes.push(`}`)
      break

    case 'document-processing':
      routes.push(`// Upload document for processing`)
      routes.push(`if (url.pathname === "/upload" && request.method === "POST") {`)
      routes.push(`  const key = \`docs/\${Date.now()}.pdf\``)
      routes.push(`  await env.BUCKET.put(key, request.body)`)
      routes.push(`  // R2 Event Notification -> Workflow -> Claude OCR -> D1`)
      routes.push(`  return Response.json({ key, status: "queued" })`)
      routes.push(`}`)
      routes.push(``)
      routes.push(`// Query extracted data`)
      routes.push(`if (url.pathname.startsWith("/documents/")) {`)
      routes.push(`  const result = await env.DB.prepare("SELECT * FROM documents LIMIT 10").all()`)
      routes.push(`  return Response.json(result)`)
      routes.push(`}`)
      break

    case 'lead-capture':
      routes.push(`// Lead form submission`)
      routes.push(`if (url.pathname === "/leads" && request.method === "POST") {`)
      routes.push(`  const body = await request.json() as { token: string; name: string; email: string }`)
      routes.push(``)
      routes.push(`  // Turnstile verification`)
      routes.push(`  const turnstile = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {`)
      routes.push(`    method: "POST",`)
      routes.push(`    body: JSON.stringify({ secret: "TURNSTILE_SECRET", response: body.token }),`)
      routes.push(`  })`)
      routes.push(`  const result = await turnstile.json() as { success: boolean }`)
      routes.push(`  if (!result.success) return new Response("Bot detected", { status: 403 })`)
      routes.push(``)
      routes.push(`  // Save to D1 + queue for CRM sync`)
      routes.push(`  await env.DB.prepare("INSERT INTO leads (name, email) VALUES (?, ?)").bind(body.name, body.email).run()`)
      routes.push(`  await env.QUEUE.send({ type: "lead", name: body.name, email: body.email })`)
      routes.push(`  return Response.json({ ok: true })`)
      routes.push(`}`)
      break

    default:
      routes.push(`// TODO: implementar rutas para ${arch.name}`)
      routes.push(`if (url.pathname === "/health") {`)
      routes.push(`  return new Response("OK")`)
      routes.push(`}`)
      break
  }

  return routes
}

/**
 * Get both generated code outputs for a given architecture ID
 */
export function getGeneratedCode(architectureId: string): { toml: string; code: string } | null {
  const arch = ARCHITECTURES_MAP[architectureId]
  if (!arch) return null
  return {
    toml: generateWranglerToml(arch),
    code: generateStarterCode(arch),
  }
}
