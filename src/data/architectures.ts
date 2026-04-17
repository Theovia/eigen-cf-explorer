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

  // ═══════════════════════════════════════════════════════════
  // New architectures (9-18)
  // ═══════════════════════════════════════════════════════════

  {
    id: "voice-realtime",
    name: "Agente de voz en tiempo real",
    tag: "WebRTC · VAD · Whisper · TTS",
    desc: "Agente de voz full-duplex: el usuario habla, el agente responde con voz en <800ms end-to-end.",
    services: [
      "workers",
      "workersCalls",
      "durableObjects",
      "aiGateway",
      "agentsSDK",
    ],
    flow: `WebRTC → Workers Calls (SFU)
  → audio tracks → Worker
     → VAD (voice activity detection)
     → Whisper STT → texto
     → AI Gateway → Claude streaming
     → TTS streaming → audio
  → audio de vuelta por WebRTC
  → DO(session) persiste turns`,
    steps: [
      "Setup Workers Calls room con WebRTC SFU para tracks de audio bidireccionales",
      "Crear Worker pipeline: recibir audio chunks → VAD → buffer hasta fin de utterance",
      "Integrar Whisper (Workers AI o API externa) para speech-to-text streaming",
      "Conectar AI Gateway con Claude para respuesta de texto en streaming",
      "Integrar TTS (ElevenLabs/OpenAI) para sintesis de voz con streaming de chunks",
      "Crear Agents SDK orchestrator para coordinar el pipeline completo VAD→STT→LLM→TTS",
      "Crear DO session class para persistir contexto conversacional entre turns",
      "Testing: latencia end-to-end <800ms, interrupciones mid-speech, ruido ambiente",
    ],
    edges: [
      { source: "workersCalls", target: "workers", label: "audio tracks" },
      { source: "workers", target: "aiGateway", label: "Whisper STT → Claude" },
      { source: "aiGateway", target: "agentsSDK", label: "orchestration" },
      { source: "agentsSDK", target: "durableObjects", label: "persist turns" },
      { source: "workers", target: "workersCalls", label: "TTS → WebRTC" },
      { source: "durableObjects", target: "workers", label: "session context" },
    ],
    costFormula: (_r, _s, a) => a * 0.012 + 15,
    costBreakdown: (_r, _s, a) => [
      {
        service: "Workers",
        role: "Audio pipeline + routing",
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
        role: "Claude streaming + cache",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Agents SDK",
        role: "Pipeline orchestration",
        estimated: 2,
        pricingNote: "Workers pricing",
      },
      {
        service: "Claude API (externo)",
        role: "Razonamiento",
        estimated: a * 0.004,
        pricingNote: "~$3/M tokens",
      },
      {
        service: "Whisper+TTS (externo)",
        role: "STT + sintesis de voz",
        estimated: a * 0.003,
        pricingNote: "~$0.006/min",
      },
    ],
  },

  {
    id: "streaming-llm",
    name: "Streaming LLM con SSE",
    tag: "Server-Sent Events · Claude · stream",
    desc: "Respuestas LLM en streaming via SSE. El usuario ve tokens en tiempo real, sin esperar respuesta completa.",
    services: ["workers", "aiGateway", "durableObjects"],
    flow: `Client GET /stream?prompt=...
  → Worker
     → AI Gateway → Claude (stream: true)
     → ReadableStream
     → TransformStream (format SSE)
     → Response (text/event-stream)
  → DO(session) persiste historial`,
    steps: [
      "Crear Worker endpoint GET /stream que acepta prompt como parametro",
      "Conectar AI Gateway con Claude usando stream: true para respuestas incrementales",
      "Crear TransformStream que convierte chunks de Claude a formato SSE (data: ...\\n\\n)",
      "Devolver ReadableStream con headers Content-Type: text/event-stream + Cache-Control: no-cache",
      "Crear DO class para persistir historial de conversacion (context window management)",
      "Implementar reconexion en cliente con Last-Event-ID para resumir streams interrumpidos",
      "Testing: cancelacion de stream, reconexion, back-pressure, latencia first-token",
    ],
    edges: [
      { source: "workers", target: "aiGateway", label: "Claude stream:true" },
      { source: "aiGateway", target: "workers", label: "ReadableStream" },
      { source: "workers", target: "durableObjects", label: "persist history" },
      { source: "durableObjects", target: "workers", label: "load context" },
    ],
    costFormula: (r, _s, a) => r * 0.0003 + a * 0.003 + 2,
    costBreakdown: (r, _s, a) => [
      {
        service: "Workers",
        role: "SSE endpoint + transform",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "AI Gateway",
        role: "Claude proxy + cache",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Durable Objects",
        role: "Historial conversacion",
        estimated: 1,
        pricingNote: "$0.15/M req + $0.20/GB",
      },
      {
        service: "Claude API (externo)",
        role: "Generacion de texto",
        estimated: a * 0.003,
        pricingNote: "~$3/M input tokens",
      },
    ],
  },

  {
    id: "multi-region",
    name: "Multi-region active-active",
    tag: "D1 · Hyperdrive · Postgres · failover",
    desc: "Lectura local con D1, escritura a Postgres centralizado via Hyperdrive. Active-active con failover automatico.",
    services: ["workers", "d1", "hyperdrive", "queues"],
    flow: `Request → Worker (edge mas cercano)
  → D1 read replica local → hit → response
  → miss → Hyperdrive → Postgres central
     → response + cache en D1
  Writes:
  → Queue → Postgres via Hyperdrive
  → D1 invalidation`,
    steps: [
      "Crear Worker con Smart Placement para routing automatico al edge mas cercano",
      "Configurar D1 database con read replicas como cache de lectura local",
      "Configurar Hyperdrive connection pool hacia Postgres central (Supabase/Neon)",
      "Implementar patron read-through: D1 hit → return, miss → Postgres → cache en D1",
      "Configurar Queue para writes: encolar → Postgres via Hyperdrive → invalidar D1 cache",
      "Implementar health checks y failover automatico entre D1 y Postgres",
      "Testing: latencia por region, consistency lag, failover recovery time",
    ],
    edges: [
      { source: "workers", target: "d1", label: "read replica local" },
      { source: "d1", target: "workers", label: "cache hit → response" },
      { source: "workers", target: "hyperdrive", label: "cache miss → Postgres" },
      { source: "hyperdrive", target: "d1", label: "cache update" },
      { source: "workers", target: "queues", label: "async writes" },
      { source: "queues", target: "hyperdrive", label: "persist to Postgres" },
    ],
    costFormula: (r, s) => r * 0.0005 + s * 0.02 + 3,
    costBreakdown: (r, s) => [
      {
        service: "Workers",
        role: "Router + edge compute",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "D1",
        role: "Read cache local",
        estimated: r * 0.00075 + s * 0.015,
        pricingNote: "$0.75/M reads",
      },
      {
        service: "Hyperdrive",
        role: "Pool Postgres central",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Queues",
        role: "Write buffer async",
        estimated: r * 0.0002,
        pricingNote: "$0.40/M msgs",
      },
    ],
  },

  {
    id: "crdt-collaboration",
    name: "Colaboracion en tiempo real con CRDTs",
    tag: "WebSocket · Yjs · Durable Objects",
    desc: "Multiples usuarios editando el mismo documento en tiempo real. Conflict-free via CRDTs, persistencia en R2.",
    services: ["workers", "durableObjects", "r2"],
    flow: `User A → WebSocket upgrade
  → DO(docId) [Yjs/Automerge state]
     ← User B WebSocket
     ← User C WebSocket
  → CRDT merge automático
  → broadcast delta a todos
  → R2 snapshot periódico`,
    steps: [
      "Crear Worker que maneja WebSocket upgrade y routea a DO por docId",
      "Crear DO class con WebSocket hibernation para manejar multiples conexiones",
      "Integrar Yjs (o Automerge) como CRDT library para merge conflict-free",
      "Implementar broadcast de deltas: cuando un usuario edita, propagar a todos los conectados",
      "Configurar R2 para snapshots periodicos del documento (cada 30s o en disconnect)",
      "Implementar restore: al conectarse, cargar ultimo snapshot de R2 + aplicar updates pendientes",
      "Implementar awareness protocol (cursores, selecciones de otros usuarios)",
      "Testing: 10+ usuarios simultaneos, network partitions, large documents, reconnect",
    ],
    edges: [
      { source: "workers", target: "durableObjects", label: "WebSocket → DO(docId)" },
      { source: "durableObjects", target: "durableObjects", label: "CRDT merge + broadcast" },
      { source: "durableObjects", target: "r2", label: "snapshot periodico" },
      { source: "r2", target: "durableObjects", label: "restore on connect" },
    ],
    costFormula: (r, s, _a, t) => r * 0.0003 + s * 0.015 + t * 0.5 + 2,
    costBreakdown: (r, s, _a, t) => [
      {
        service: "Workers",
        role: "WebSocket upgrade + routing",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Durable Objects",
        role: "CRDT state por documento",
        estimated: t * 0.5 + 1,
        pricingNote: "$0.15/M req + $0.20/GB",
      },
      {
        service: "R2",
        role: "Document snapshots",
        estimated: s * 0.015,
        pricingNote: "$0.015/GB, $0 egress",
      },
    ],
  },

  {
    id: "feature-flags",
    name: "Feature flags + A/B testing",
    tag: "KV · Durable Objects · Analytics",
    desc: "Feature flags en el edge con evaluacion <10ms. A/B testing con buckets deterministicos y tracking de exposiciones.",
    services: ["workers", "kv", "durableObjects", "analyticsEngine"],
    flow: `Request → Worker
  → KV.get("flags") [<10ms]
  → hash(userId) → bucket assignment
  → evaluate rules
  → DO(flagId) record exposure
  → Analytics Engine track event
  → response con features activas`,
    steps: [
      "Crear Worker endpoint que recibe userId y evalua feature flags",
      "Almacenar flag definitions en KV (JSON): conditions, rollout %, variants",
      "Implementar hash deterministico: murmurhash(userId + flagName) % 100 → bucket",
      "Crear DO class por flagId para contar exposiciones y tracking de variantes",
      "Escribir a Analytics Engine cada evaluacion: flagId, variant, userId, timestamp",
      "Crear admin endpoint para CRUD de flags (PUT /flags → actualizar KV)",
      "Testing: consistency de bucket assignment, propagacion de cambios KV, analytics queries",
    ],
    edges: [
      { source: "workers", target: "kv", label: "load flag definitions" },
      { source: "workers", target: "durableObjects", label: "record exposure" },
      { source: "durableObjects", target: "analyticsEngine", label: "track events" },
      { source: "kv", target: "workers", label: "flags <10ms" },
    ],
    costFormula: (r) => r * 0.0005 + 2,
    costBreakdown: (r) => [
      {
        service: "Workers",
        role: "Flag evaluator",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "KV",
        role: "Flag definitions",
        estimated: r * 0.0005,
        pricingNote: "$0.50/M reads",
      },
      {
        service: "Durable Objects",
        role: "Exposure counters",
        estimated: 1,
        pricingNote: "$0.15/M req",
      },
      {
        service: "Analytics Engine",
        role: "Event tracking",
        estimated: r * 0.00025,
        pricingNote: "$0.25/M datapoints",
      },
    ],
  },

  {
    id: "webhook-fanout",
    name: "Webhook fan-out / event bus",
    tag: "Queues · consumers · DLQ",
    desc: "Recibe un webhook, lo distribuye a N consumers (email, CRM, analytics, Slack). Idempotente con dead-letter queue.",
    services: ["workers", "queues", "analyticsEngine"],
    flow: `Event POST /events
  → Worker publisher
     → validate + dedupe hash
     → Queue principal
        → Consumer 1: email notification
        → Consumer 2: CRM sync
        → Consumer 3: Analytics Engine
        → Consumer 4: Slack notify
     → DLQ para fallos
  → 202 Accepted inmediato`,
    steps: [
      "Crear Worker publisher que valida payload, genera idempotency key, y encola",
      "Configurar Queue principal con max_batch_size: 100 y retry policy",
      "Crear consumer Worker que rutea por event.type a handlers especificos",
      "Implementar idempotencia: hash(event.id) como dedupe key en Queue",
      "Configurar dead-letter queue (DLQ) para mensajes que fallan 3+ veces",
      "Escribir metricas a Analytics Engine: events processed, latency, errors por tipo",
      "Testing: doble envio (idempotencia), consumer crash (retry), DLQ flow, throughput",
    ],
    edges: [
      { source: "workers", target: "queues", label: "publish event" },
      { source: "queues", target: "workers", label: "N consumers" },
      { source: "queues", target: "queues", label: "DLQ fallback" },
      { source: "workers", target: "analyticsEngine", label: "track metrics" },
    ],
    costFormula: (r) => r * 0.0007 + 1,
    costBreakdown: (r) => [
      {
        service: "Workers",
        role: "Publisher + consumers",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Queues",
        role: "Fan-out + DLQ",
        estimated: r * 0.0004,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "Analytics Engine",
        role: "Event metrics",
        estimated: r * 0.00025,
        pricingNote: "$0.25/M datapoints",
      },
    ],
  },

  {
    id: "api-aggregator",
    name: "API aggregator con rate limiting",
    tag: "Gateway · quotas · per-key limiting",
    desc: "Gateway para APIs con rate limiting per-key, token validation, y quota management via Durable Objects.",
    services: ["workers", "durableObjects", "aiGateway"],
    flow: `Partner request → Worker gateway
  → validate Bearer token
  → DO(apiKey) consume quota
     → remaining > 0 → allow
     → remaining = 0 → 429 Too Many Requests
  → Service Binding → backend Workers
  → AI Gateway si hay llamadas AI
  → response + rate limit headers`,
    steps: [
      "Crear Worker gateway que valida Bearer token y extrae apiKey",
      "Crear DO class per apiKey: quota counter, rate window, tier limits",
      "Implementar sliding window rate limiting en el DO (requests/min + requests/day)",
      "Conectar via Service Bindings a Workers backend (microservicios internos)",
      "Si la API incluye AI, rutear via AI Gateway para cache y cost tracking",
      "Agregar X-RateLimit-* headers en response (Remaining, Reset, Limit)",
      "Crear admin API para CRUD de API keys y tier management",
      "Testing: concurrent requests per key, quota reset, tier upgrade, burst handling",
    ],
    edges: [
      { source: "workers", target: "durableObjects", label: "consume quota" },
      { source: "durableObjects", target: "workers", label: "allow/deny" },
      { source: "workers", target: "aiGateway", label: "AI calls proxied" },
      { source: "aiGateway", target: "workers", label: "response" },
    ],
    costFormula: (r, _s, a) => r * 0.0004 + a * 0.001 + 3,
    costBreakdown: (r, _s, a) => [
      {
        service: "Workers",
        role: "API gateway + routing",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Durable Objects",
        role: "Per-key rate limiter",
        estimated: r * 0.00015 + 1,
        pricingNote: "$0.15/M req",
      },
      {
        service: "AI Gateway",
        role: "AI proxy + cache",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Claude API (externo)",
        role: "AI calls",
        estimated: a * 0.001,
        pricingNote: "~$3/M tokens",
      },
    ],
  },

  {
    id: "content-moderation",
    name: "Pipeline de content moderation",
    tag: "Workers AI · Llama Guard · CLIP · Claude",
    desc: "Upload → moderacion automatica con Llama Guard + CLIP → borderline a Claude → quarantine o publish.",
    services: ["workers", "workersAI", "queues", "r2", "workflows"],
    flow: `Upload → R2 (raw)
  → R2 Event Notification → Worker
  → Workers AI:
     ├→ Llama Guard (texto) → safe/borderline/block
     └→ CLIP (imagen) → safe/borderline/block
  → borderline → Claude second pass
  → Workflow:
     approved → R2 (public)
     rejected → quarantine + notify`,
    steps: [
      "Configurar R2 bucket 'uploads' con Event Notifications hacia un Worker",
      "Crear Worker que recibe R2 events y lanza pipeline de moderacion",
      "Integrar Workers AI con Llama Guard para clasificacion de texto (safe/borderline/block)",
      "Integrar Workers AI con CLIP para clasificacion de imagenes",
      "Conectar AI Gateway con Claude para second pass en contenido borderline",
      "Crear Workflow: step1(classify) → step2(second_pass if borderline) → step3(publish or quarantine)",
      "Mover contenido aprobado a R2 'public', rechazado a R2 'quarantine'",
      "Testing: contenido safe, borderline, toxico. False positive rate. Latencia pipeline",
    ],
    edges: [
      { source: "r2", target: "workers", label: "R2 event notification" },
      { source: "workers", target: "workersAI", label: "Llama Guard + CLIP" },
      { source: "workersAI", target: "workflows", label: "classification result" },
      { source: "workflows", target: "r2", label: "publish or quarantine" },
      { source: "workflows", target: "queues", label: "notify moderators" },
    ],
    costFormula: (r, s, a) => r * 0.0003 + s * 0.015 + a * 0.002 + 2,
    costBreakdown: (r, s, a) => [
      {
        service: "Workers",
        role: "Pipeline orchestration",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Workers AI",
        role: "Llama Guard + CLIP",
        estimated: a * 0.001,
        pricingNote: "~$0.01/M tokens",
      },
      {
        service: "R2",
        role: "Raw + public + quarantine",
        estimated: s * 0.015,
        pricingNote: "$0.015/GB",
      },
      {
        service: "Queues",
        role: "Moderator notifications",
        estimated: r * 0.0001,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "Workflows",
        role: "Pipeline durable",
        estimated: 0.5,
        pricingNote: "Workers pricing/step",
      },
      {
        service: "Claude API (externo)",
        role: "Second pass borderline",
        estimated: a * 0.001,
        pricingNote: "~$3/M tokens",
      },
    ],
  },

  {
    id: "document-processing",
    name: "Pipeline OCR + extraccion",
    tag: "R2 · Claude multimodal · Workflows · D1",
    desc: "Sube un PDF, Claude lo lee con vision multimodal, extrae datos estructurados, valida con Zod, guarda en D1.",
    services: ["workers", "r2", "aiGateway", "workflows", "d1"],
    flow: `Upload PDF → R2
  → R2 Event Notification → Worker
  → Workflow:
     step 1: R2.get(key) → base64
     step 2: Claude multimodal OCR
     step 3: Zod validate schema
     step 4: D1 INSERT structured data
     step 5: notify success/failure`,
    steps: [
      "Configurar R2 bucket 'documents' con Event Notifications",
      "Crear Workflow con 5 pasos durables para procesamiento de documentos",
      "Step 1: leer PDF de R2, convertir a base64 para Claude multimodal",
      "Step 2: enviar a Claude via AI Gateway con prompt de extraccion estructurada",
      "Step 3: validar output de Claude contra schema Zod (nombre, fecha, montos, etc.)",
      "Step 4: insertar datos validados en D1 (tabla documents con campos tipados)",
      "Step 5: notificar resultado (success con datos, o failure con errores de validacion)",
      "Testing: PDFs escaneados, calidad baja, multiples paginas, schemas complejos",
    ],
    edges: [
      { source: "r2", target: "workers", label: "R2 event → trigger" },
      { source: "workers", target: "workflows", label: "start pipeline" },
      { source: "workflows", target: "r2", label: "read PDF" },
      { source: "workflows", target: "aiGateway", label: "Claude multimodal OCR" },
      { source: "workflows", target: "d1", label: "INSERT structured data" },
    ],
    costFormula: (r, s, a) => r * 0.0003 + s * 0.015 + a * 0.005 + 3,
    costBreakdown: (r, s, a) => [
      {
        service: "Workers",
        role: "Event handler",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "R2",
        role: "Document storage",
        estimated: s * 0.015,
        pricingNote: "$0.015/GB",
      },
      {
        service: "AI Gateway",
        role: "Claude proxy + cache",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "Workflows",
        role: "5-step durable pipeline",
        estimated: 1,
        pricingNote: "Workers pricing/step",
      },
      {
        service: "D1",
        role: "Structured data store",
        estimated: r * 0.001,
        pricingNote: "$1.00/M writes",
      },
      {
        service: "Claude API (externo)",
        role: "Multimodal OCR",
        estimated: a * 0.005,
        pricingNote: "~$3/M tokens (vision)",
      },
    ],
  },

  {
    id: "lead-capture",
    name: "Lead capture con Turnstile + CRM",
    tag: "Pages · Turnstile · D1 · Queues",
    desc: "Formulario protegido con Turnstile, datos a D1, sync async a CRM y notificacion a Slack.",
    services: ["workers", "pages", "d1", "queues"],
    flow: `Formulario (Pages)
  → Turnstile verify token
  → Worker validate + sanitize
  → D1 INSERT lead
  → Queue:
     → Consumer 1: CRM sync (HubSpot/Pipedrive)
     → Consumer 2: Slack webhook notification
     → Consumer 3: email de confirmacion
  → 200 OK al usuario`,
    steps: [
      "Crear landing page en Pages con formulario + Turnstile widget integrado",
      "Crear Worker endpoint POST /leads que verifica Turnstile token via API",
      "Validar y sanitizar datos del formulario (Zod schema: name, email, phone, message)",
      "Insertar lead en D1 con timestamp y source tracking",
      "Encolar eventos a Queue para procesamiento async (CRM, Slack, email)",
      "Crear consumer que sincroniza lead a CRM (HubSpot API / Pipedrive API)",
      "Crear consumer que envia notificacion a Slack via webhook",
      "Testing: bot detection (Turnstile), doble envio, CRM sync failure + retry",
    ],
    edges: [
      { source: "pages", target: "workers", label: "form submit" },
      { source: "workers", target: "d1", label: "INSERT lead" },
      { source: "workers", target: "queues", label: "async sync" },
      { source: "queues", target: "workers", label: "CRM + Slack + email" },
    ],
    costFormula: (r, s) => r * 0.0003 + s * 0.015 + 1,
    costBreakdown: (r, s) => [
      {
        service: "Workers",
        role: "API + consumers",
        estimated: r * 0.0003,
        pricingNote: "$0.30/M req",
      },
      {
        service: "Pages",
        role: "Landing page",
        estimated: 0,
        pricingNote: "Gratuito",
      },
      {
        service: "D1",
        role: "Lead database",
        estimated: r * 0.001 + s * 0.015,
        pricingNote: "$1.00/M writes",
      },
      {
        service: "Queues",
        role: "CRM + Slack + email",
        estimated: r * 0.0004,
        pricingNote: "$0.40/M msgs",
      },
      {
        service: "Turnstile (externo)",
        role: "Bot protection",
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
