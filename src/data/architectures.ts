import type { Architecture } from "./types.ts"

export const ARCHITECTURES: Architecture[] = [
  {
    id: "whatsapp-agent",
    name: "Agente conversacional WhatsApp",
    tag: "Dr. Marcos · clínicas · hoteles",
    desc: "Bot 24/7 con agenda, pagos y escalamiento humano. Agente con herramientas reales y memoria persistente.",
    services: [
      "workers",
      "durableObjects",
      "agentsSDK",
      "vectorize",
      "aiGateway",
      "queues",
    ],
    flow: `WhatsApp Cloud API → Worker (verifica firma HMAC)
  → DO(conversationId).hydrate()
     → contexto de Vectorize
     → AI Gateway → Claude (cache 1h)
     → tool call: Calendar / Stripe / Supabase
     → DO persiste estado
  → respuesta por WA API
  → Analytics Engine (latencia, tokens, satisfacción)`,
    steps: [
      "Crear Worker con fetch handler para webhook verification (GET) y message processing (POST)",
      "Configurar WhatsApp Cloud API: verificar token, webhook URL, HMAC signature validation",
      "Crear Durable Object class para conversaciones: hydrate(), persist(), alarm() para TTL",
      "Configurar Vectorize namespace con embeddings del dominio (servicios, FAQ, precios)",
      "Conectar AI Gateway con Claude: definir guardrails (PII, injection), cache policy 1h",
      "Definir tools del agente: calendar_check, calendar_book, payment_create, escalate_human",
      "Crear Queue para async processing (confirmaciones, notificaciones, analytics)",
      "Crear pipeline de Analytics Engine para métricas (latencia, tokens, satisfacción)",
      "Testing: flujo completo webhook→DO→Claude→tool→response, edge cases, rate limiting",
    ],
    edges: [
      { source: "workers", target: "durableObjects", label: "hydrate session" },
      { source: "durableObjects", target: "vectorize", label: "load context" },
      { source: "vectorize", target: "aiGateway", label: "Claude + cache" },
      { source: "aiGateway", target: "agentsSDK", label: "tool orchestration" },
      { source: "agentsSDK", target: "workers", label: "tool execution" },
      { source: "workers", target: "queues", label: "async jobs" },
      { source: "durableObjects", target: "workers", label: "persist + respond" },
    ],
    costFormula: (r, s, a) => r * 0.0003 + s * 0.015 + a * 0.003 + 5,
    costBreakdown: (r, s, a) => [
      {
        service: "Workers",
        role: "Ingestor + API",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Durable Objects",
        role: "Sesión por paciente",
        estimated: s * 0.015 + 1,
        pricingNote: "$0.15/M req + $0.20/GB",
      },
      {
        service: "Agents SDK",
        role: "Orquestación (DO+CPU)",
        estimated: 1.5,
        pricingNote: "Workers pricing",
      },
      {
        service: "Vectorize",
        role: "Memoria semántica",
        estimated: a * 0.001,
        pricingNote: "$0.01/M queries",
      },
      {
        service: "AI Gateway",
        role: "Claude + guardrails",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Queues",
        role: "Async processing",
        estimated: a * 0.0004,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "Claude API (externo)",
        role: "Razonamiento",
        estimated: a * 0.002,
        pricingNote: "~$3/M input tokens",
      },
    ],
  },

  {
    id: "multi-tenant",
    name: "SaaS multi-tenant",
    tag: "Eigen Atlas · plataforma",
    desc: "Cada cliente con código custom, SQLite exclusiva, subdominio propio. Escala a 50+ tenants.",
    services: [
      "workers",
      "durableObjects",
      "d1",
      "access",
      "pages",
      "aiGateway",
    ],
    flow: `Request → hostname custom (acme.eigen.dev)
  → Dispatcher Worker
     → resuelve tenantId
     → Worker aislado del tenant
        → DO Facet con SQLite exclusiva
  → response tipada
  → Analytics Engine central`,
    steps: [
      "Crear Dispatcher Worker que resuelve tenantId desde hostname (acme.eigen.dev)",
      "Crear DO Facet class con SQLite exclusiva por tenant",
      "Configurar D1 para schema compartido (tenant registry, billing, global config)",
      "Setup Access policies para admin panel con email allowlist + MFA",
      "Deploy frontend en Pages con subdominios wildcard (*.eigen.dev)",
      "Conectar AI Gateway para AI features per-tenant con cost attribution",
      "Testing: tenant isolation, failover, billing per-tenant",
    ],
    edges: [
      { source: "workers", target: "durableObjects", label: "tenant isolation" },
      { source: "workers", target: "d1", label: "tenant registry" },
      { source: "durableObjects", target: "d1", label: "shared schema" },
      { source: "access", target: "workers", label: "SSO + JWT" },
      { source: "pages", target: "workers", label: "frontend → API" },
      { source: "workers", target: "aiGateway", label: "AI per tenant" },
    ],
    costFormula: (r, s, _a, t) => r * 0.0003 * t + s * 0.02 * t + 10,
    costBreakdown: (r, s, _a, t) => [
      {
        service: "Workers",
        role: "Dispatcher + tenant",
        estimated: r * 0.0003 * t,
        pricingNote: "$0.30/M req x " + t + " tenants",
      },
      {
        service: "Durable Objects",
        role: "DO Facet por tenant",
        estimated: s * 0.02 * t,
        pricingNote: "$0.20/GB x " + t + " tenants",
      },
      {
        service: "D1",
        role: "Schema compartido",
        estimated: r * 0.00075,
        pricingNote: "$0.75/M reads",
      },
      {
        service: "Access",
        role: "SSO admin",
        estimated: 0,
        pricingNote: "Gratis <50 users",
      },
      {
        service: "Pages",
        role: "Frontend",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "AI Gateway",
        role: "AI per tenant",
        estimated: 0,
        pricingNote: "Gratuito",
      },
    ],
  },

  {
    id: "analytics",
    name: "Pipeline analítico edge-nativo",
    tag: "Reportes · dashboards · data",
    desc: "Eventos, datos históricos, dashboards — sin Kafka, sin Snowflake, sin Airflow.",
    services: ["workers", "r2", "queues", "d1", "analyticsEngine"],
    flow: `Eventos HTTP
  → Pipeline (buffer + batch)
     ├→ R2 Data Catalog (Iceberg)
     ├→ Analytics Engine (near-RT)
     └→ D1 (aggregates)

Queries:
  Analytics Engine → dashboard HTML
  Data Catalog → DuckDB → reportes`,
    steps: [
      "Crear Worker ingesta que recibe eventos HTTP y valida schema",
      "Configurar Queue para buffering + batching (lotes de 100 eventos)",
      "Setup R2 bucket con Data Catalog (Iceberg format) para históricos",
      "Configurar Analytics Engine para métricas near-RT con writeDataPoint()",
      "Crear D1 database para aggregates pre-computados",
      "Crear Worker dashboard que sirve HTML con queries a Analytics Engine",
      "Testing: throughput, latencia de queries, consistencia de datos",
    ],
    edges: [
      { source: "workers", target: "queues", label: "buffer + batch" },
      { source: "queues", target: "r2", label: "Data Catalog" },
      { source: "queues", target: "analyticsEngine", label: "near-RT metrics" },
      { source: "queues", target: "d1", label: "aggregates" },
      { source: "analyticsEngine", target: "workers", label: "dashboard queries" },
      { source: "r2", target: "workers", label: "DuckDB reportes" },
    ],
    costFormula: (r, s) => r * 0.0005 + s * 0.015 + 3,
    costBreakdown: (r, s) => [
      {
        service: "Workers",
        role: "Ingesta + dashboard",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "R2",
        role: "Data Catalog",
        estimated: s * 0.015,
        pricingNote: "$0.015/GB",
      },
      {
        service: "Queues",
        role: "Buffer + batch",
        estimated: r * 0.0004,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "D1",
        role: "Aggregates near-RT",
        estimated: r * 0.00075,
        pricingNote: "$0.75/M reads",
      },
      {
        service: "Analytics Engine",
        role: "Métricas tiempo real",
        estimated: r * 0.00025,
        pricingNote: "$0.25/M datapoints",
      },
    ],
  },

  {
    id: "payments",
    name: "Pagos con idempotencia",
    tag: "Stripe · cobros · dunning",
    desc: "Webhooks sin doble cobro, sin pérdida, con dunning automático.",
    services: [
      "workers",
      "queues",
      "durableObjects",
      "workflows",
      "emailService",
    ],
    flow: `Stripe webhook → Worker (HMAC verify)
  → Queue (dedupe event.id)
  → 200 inmediato

Consumer:
  → DO(customerId)
  → if processed: skip
  → else: apply + Workflow dunning`,
    steps: [
      "Crear Worker receptor de webhooks Stripe con HMAC verification",
      "Configurar Queue con dedupe por event.id (idempotencia en ingesta)",
      "Crear DO class por customerId para estado de pagos (processed set)",
      "Implementar consumer idempotente: check processed → apply → mark",
      "Crear Workflow para dunning: step1(notify) → sleep(3d) → step2(retry) → step3(cancel)",
      "Conectar Email Service para recibos y notificaciones de dunning",
      "Testing: doble webhook, concurrent payments, dunning flow completo",
    ],
    edges: [
      { source: "workers", target: "queues", label: "dedupe event.id" },
      { source: "queues", target: "durableObjects", label: "apply payment" },
      { source: "durableObjects", target: "workflows", label: "trigger dunning" },
      { source: "workflows", target: "emailService", label: "send notifications" },
      { source: "workflows", target: "durableObjects", label: "update state" },
    ],
    costFormula: (r, s) => r * 0.0003 + s * 0.02 + 5,
    costBreakdown: (r, s) => [
      {
        service: "Workers",
        role: "Verificador + consumer",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Queues",
        role: "Dedupe event.id",
        estimated: r * 0.0004,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "Durable Objects",
        role: "Estado customer",
        estimated: s * 0.02 + 0.5,
        pricingNote: "$0.15/M req + $0.20/GB",
      },
      {
        service: "Workflows",
        role: "Dunning saga",
        estimated: 1,
        pricingNote: "Workers pricing/step",
      },
      {
        service: "Email Service",
        role: "Recibos + notif",
        estimated: 0,
        pricingNote: "Gratis (beta)",
      },
    ],
  },

  {
    id: "rag",
    name: "Chatbot RAG",
    tag: "FAQ · soporte · knowledge base",
    desc: "Chatbot que responde solo con base en docs del cliente. Cero alucinaciones.",
    services: [
      "workers",
      "aiSearch",
      "r2",
      "vectorize",
      "workersAI",
      "aiGateway",
    ],
    flow: `Ingestión:
  Docs → R2 → AI Search (auto-ingesta)

Consulta:
  POST /chat → AI Search hybrid retrieval
  → rerank top 5
  → Claude: 'SOLO responde con docs'
  → response con citations`,
    steps: [
      "Setup R2 bucket para documentos fuente (PDF, MD, HTML, TXT)",
      "Configurar AI Search instance con auto-ingesta desde R2",
      "Crear embeddings con Workers AI para Vectorize (backup/custom search)",
      "Crear Worker endpoint POST /chat con hybrid retrieval pipeline",
      "Configurar AI Gateway con Claude: system prompt 'SOLO responde con docs proporcionados'",
      "Implementar citations con source tracking desde AI Search results",
      "Testing: relevancia, alucinaciones (debe rechazar preguntas sin docs), latencia",
    ],
    edges: [
      { source: "r2", target: "aiSearch", label: "auto-ingesta docs" },
      { source: "workers", target: "aiSearch", label: "hybrid retrieval" },
      { source: "aiSearch", target: "vectorize", label: "embeddings" },
      { source: "workers", target: "workersAI", label: "reranking" },
      { source: "workers", target: "aiGateway", label: "Claude + cache" },
      { source: "aiGateway", target: "workers", label: "response + citations" },
    ],
    costFormula: (r, s, a) => r * 0.0003 + s * 0.015 + a * 0.002 + 3,
    costBreakdown: (r, s, a) => [
      {
        service: "Workers",
        role: "Chat endpoint",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "AI Search",
        role: "Retrieval híbrido",
        estimated: a * 0.001,
        pricingNote: "Workers AI pricing",
      },
      {
        service: "R2",
        role: "Docs originales",
        estimated: s * 0.015,
        pricingNote: "$0.015/GB",
      },
      {
        service: "Vectorize",
        role: "Embeddings",
        estimated: a * 0.0001,
        pricingNote: "$0.01/M queries",
      },
      {
        service: "Workers AI",
        role: "Reranking + embeddings",
        estimated: a * 0.0005,
        pricingNote: "~$0.01/M tokens",
      },
      {
        service: "AI Gateway",
        role: "Claude + cache",
        estimated: 0,
        pricingNote: "Gratuito",
      },
    ],
  },

  {
    id: "email-intake",
    name: "Intake de correo inteligente",
    tag: "Clasificación · triage · agente",
    desc: "Bandeja atendida por agente: clasifica, responde trivial, escala ambiguo.",
    services: [
      "workers",
      "emailService",
      "agentsSDK",
      "workflows",
      "aiGateway",
    ],
    flow: `Email → MX Cloudflare → Email Worker
  → parse MIME
  → Guardrails PII
  → Claude clasifica
  → Workflow: acción por tipo
     agendar / cobrar / queja / urgente
  → archivo en R2`,
    steps: [
      "Configurar dominio MX en Cloudflare para Email Routing",
      "Crear Email Worker que parsea MIME (headers, body, attachments)",
      "Conectar AI Gateway con Claude para clasificación + guardrails PII",
      "Crear Agents SDK class para orquestación de clasificación",
      "Crear Workflow por tipo: agendar→Calendar, cobrar→Stripe, queja→escalate, urgente→notify",
      "Archivar emails procesados en R2 con metadata",
      "Testing: emails con adjuntos, spam, ambiguos, escalamiento",
    ],
    edges: [
      { source: "emailService", target: "workers", label: "parse MIME" },
      { source: "workers", target: "aiGateway", label: "Claude clasifica" },
      { source: "aiGateway", target: "agentsSDK", label: "orchestrate" },
      { source: "agentsSDK", target: "workflows", label: "action by type" },
      { source: "workflows", target: "emailService", label: "send response" },
    ],
    costFormula: (r, s, a) => r * 0.0003 + s * 0.015 + a * 0.003 + 2,
    costBreakdown: (r, _s, a) => [
      {
        service: "Workers",
        role: "Email handler",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Email Service",
        role: "Send + receive",
        estimated: 0,
        pricingNote: "Gratis (beta)",
      },
      {
        service: "Agents SDK",
        role: "Clasificador (DO+CPU)",
        estimated: 1,
        pricingNote: "Workers pricing",
      },
      {
        service: "Workflows",
        role: "Acciones por tipo",
        estimated: 0.5,
        pricingNote: "Workers pricing/step",
      },
      {
        service: "AI Gateway",
        role: "Claude + guardrails",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Claude API (externo)",
        role: "Clasificación",
        estimated: a * 0.003,
        pricingNote: "~$3/M input tokens",
      },
    ],
  },

  {
    id: "voice",
    name: "Agente de voz en tiempo real",
    tag: "Llamadas · WebRTC · Whisper+TTS",
    desc: "El paciente habla, el agente responde con voz en <800ms.",
    services: [
      "workers",
      "workersCalls",
      "durableObjects",
      "aiGateway",
      "agentsSDK",
    ],
    flow: `Llamada → Workers Calls (WebRTC SFU)
  → tracks audio → Worker
     → VAD → Whisper → texto
     → Guardrails
     → Claude streaming
     → TTS streaming
     → audio de vuelta por WebRTC
  → DO(session) persiste turns`,
    steps: [
      "Setup Workers Calls room para WebRTC SFU (audio tracks)",
      "Crear Worker pipeline: audio chunks → VAD → buffer",
      "Integrar Whisper (Workers AI) para STT streaming",
      "Conectar AI Gateway con Claude streaming para respuesta de texto",
      "Integrar TTS (ElevenLabs/OpenAI) para síntesis de voz streaming",
      "Crear DO session class para persistir turns y contexto",
      "Crear Agents SDK orchestrator para el flujo completo",
      "Testing: latencia end-to-end <800ms, interrupciones, noise handling",
    ],
    edges: [
      { source: "workersCalls", target: "workers", label: "audio tracks" },
      { source: "workers", target: "aiGateway", label: "Whisper → Claude" },
      { source: "aiGateway", target: "agentsSDK", label: "orchestration" },
      { source: "agentsSDK", target: "durableObjects", label: "persist turns" },
      { source: "workers", target: "workersCalls", label: "TTS → WebRTC" },
      { source: "durableObjects", target: "workers", label: "session context" },
    ],
    costFormula: (_r, _s, a) => a * 0.01 + 15,
    costBreakdown: (_r, _s, a) => [
      {
        service: "Workers",
        role: "Audio pipeline",
        estimated: 2,
        pricingNote: "$0.30/M req + CPU",
      },
      {
        service: "Workers Calls",
        role: "WebRTC SFU",
        estimated: a * 0.005,
        pricingNote: "$0.05/1K track-min",
      },
      {
        service: "Durable Objects",
        role: "Session state",
        estimated: 1,
        pricingNote: "$0.15/M req + $0.20/GB",
      },
      {
        service: "AI Gateway",
        role: "Claude streaming",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Agents SDK",
        role: "Orchestration",
        estimated: 2,
        pricingNote: "Workers pricing",
      },
      {
        service: "Claude API (externo)",
        role: "Razonamiento",
        estimated: a * 0.003,
        pricingNote: "~$3/M tokens",
      },
      {
        service: "Whisper+TTS (externo)",
        role: "STT/TTS",
        estimated: a * 0.002,
        pricingNote: "~$0.006/min",
      },
    ],
  },

  {
    id: "zero-trust",
    name: "Zero-trust internal tools",
    tag: "Admin panels · dashboards",
    desc: "Tools internas protegidas sin VPN, sin Auth0. SSO + MFA.",
    services: ["workers", "access", "tunnel", "hyperdrive", "d1", "pages"],
    flow: `Usuario → admin.eigen.dev
  → Access: email? MFA? device?
     sí → JWT (15 min)
     no → deny + audit
  → Worker (Cf-Access headers)
  → role-based authz
  → Hyperdrive → Postgres
  → response + audit R2`,
    steps: [
      "Configurar Access application en admin.eigen.dev con email allowlist",
      "Setup MFA policy y device posture checks",
      "Instalar cloudflared y crear Tunnel hacia servicios on-prem/VPC",
      "Configurar Hyperdrive connection pool hacia Postgres",
      "Crear Worker API con role-based authz (Cf-Access-JWT headers)",
      "Crear D1 cache para reads frecuentes",
      "Deploy frontend admin en Pages",
      "Audit logging a R2 para compliance",
      "Testing: acceso no autorizado, MFA flow, latencia queries via Hyperdrive",
    ],
    edges: [
      { source: "access", target: "workers", label: "JWT auth" },
      { source: "workers", target: "hyperdrive", label: "Postgres pool" },
      { source: "workers", target: "d1", label: "cache reads" },
      { source: "tunnel", target: "hyperdrive", label: "on-prem link" },
      { source: "pages", target: "access", label: "SSO gate" },
      { source: "pages", target: "workers", label: "API calls" },
    ],
    costFormula: (r, s) => r * 0.0003 + s * 0.015 + 0,
    costBreakdown: (r, s) => [
      {
        service: "Workers",
        role: "API interna",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Access",
        role: "SSO + MFA",
        estimated: 0,
        pricingNote: "Gratis <50 users",
      },
      {
        service: "Tunnel",
        role: "On-prem link",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Hyperdrive",
        role: "Pool Postgres",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "D1",
        role: "Cache local",
        estimated: s * 0.015,
        pricingNote: "$0.75/M reads",
      },
      {
        service: "Pages",
        role: "Frontend admin",
        estimated: 0,
        pricingNote: "Gratuito",
      },
    ],
  },
]

/** Map of architecture ID → Architecture for quick lookup */
export const ARCHITECTURES_MAP: Record<string, Architecture> = Object.fromEntries(
  ARCHITECTURES.map((a) => [a.id, a]),
)
