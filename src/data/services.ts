import type { Service } from "./types.ts"

export const SERVICES: Record<string, Service> = {
  workers: {
    id: "workers",
    name: "Workers",
    cat: "compute",
    desc: "Funciones TypeScript/JS en V8 isolates en ~330 PoPs. Sin cold starts. Handlers: fetch, scheduled, queue, email, tail, alarm.",
    limits: [
      { label: "CPU time", value: "10-30ms free / 30s paid" },
      { label: "Memory", value: "128 MB" },
      { label: "Subrequests", value: "50 por invocación" },
      { label: "Script size", value: "10 MB paid" },
      { label: "Requests", value: "100K/día free" },
    ],
    pricing: "$0.30/M requests + $0.02/M ms CPU",
    gotcha:
      "No hay procesos background dentro del Worker. Para async usa Queues/Workflows. imports de Node (fs, child_process) no funcionan.",
    use: "Todo compute HTTP, webhooks, APIs, cron jobs.",
    notUse:
      "Procesos >30s, workloads CPU-bound pesados, background jobs (usa Queues).",
    link: "https://developers.cloudflare.com/workers/",
    vs: [
      {
        title: "Workers vs Lambda",
        body: "Workers: 0ms cold start, V8 isolates, ~330 PoPs. Lambda: más CPU (15min), ecosistema AWS. Workers gana en latencia y DX. Lambda gana en workloads CPU-heavy.",
      },
      {
        title: "Workers vs Vercel Functions",
        body: "Workers: global edge, pricing por request. Vercel: Next.js integrado, regiones limitadas. Workers para APIs puras, Vercel para fullstack Next.js.",
      },
    ],
  },

  durableObjects: {
    id: "durableObjects",
    name: "Durable Objects",
    cat: "storage",
    desc: "Actors con estado consistente por entidad. Un DO por ID, strong consistency, serialización automática. Hibernation cuando idle. Alarms para scheduling por entidad.",
    limits: [
      { label: "Storage", value: "Ilimitado (SQLite)" },
      { label: "Requests", value: "Serializados por DO" },
      { label: "Instances", value: "1 global por ID" },
      { label: "Alarms", value: "Sí" },
      { label: "WebSockets", value: "Sí + hibernation" },
    ],
    pricing: "$0.15/M requests + $0.20/GB/mes",
    gotcha:
      "Single-writer por ID. Si un customerId genera 10K writes/s, se satura. Solución: particionar por eventType o sharding.",
    use: "Estado por usuario/sesión. Contadores consistentes. Chat. Reservas con concurrencia.",
    notUse:
      "Queries SQL cross-entity (usa D1). Cache global (usa KV). Archivos (usa R2).",
    link: "https://developers.cloudflare.com/durable-objects/",
    vs: [
      {
        title: "DO vs D1",
        body: "DO: estado por entidad, strong consistency, actor pattern. D1: SQL relacional, queries cross-entity. Usa DO para sesiones/contadores, D1 para catálogos/reportes.",
      },
      {
        title: "DO vs KV",
        body: "DO: strong consistency, single-writer. KV: eventual consistency, lecturas ultra-rápidas. Nunca KV para contadores o auth tokens.",
      },
    ],
  },

  d1: {
    id: "d1",
    name: "D1",
    cat: "storage",
    desc: "SQLite distribuido en el edge. SQL completo: joins, window functions, CTEs. Read replicas. Sessions API para read-your-writes.",
    limits: [
      { label: "Max DB", value: "10 GB paid" },
      { label: "Rows/query", value: "5M" },
      { label: "Write QPS", value: "~1000" },
      { label: "Read replicas", value: "Sí" },
      { label: "Sessions", value: "Sí" },
    ],
    pricing: "$0.75/M reads, $1.00/M writes",
    gotcha:
      "No es Postgres. Sin extensiones, sin bulk ops masivas. Para volumen serio usa Postgres + Hyperdrive.",
    use: "Datos relacionales de tamaño medio: catálogos, usuarios, reservas.",
    notUse: "Volumen >1K writes/s. Datos >10GB. Extensiones Postgres.",
    link: "https://developers.cloudflare.com/d1/",
    vs: [
      {
        title: "D1 vs DO (SQLite)",
        body: "D1: queries SQL cross-entity, read replicas. DO SQLite: aislamiento por actor, strong consistency por ID. D1 para catálogos, DO para estado por entidad.",
      },
      {
        title: "D1 vs Postgres + Hyperdrive",
        body: "D1: edge-native, sin servidor, <10GB. Postgres: extensiones, escala ilimitada, pero necesita Hyperdrive para connection pooling desde Workers. D1 si cabe, Postgres si excedes.",
      },
    ],
  },

  kv: {
    id: "kv",
    name: "Workers KV",
    cat: "storage",
    desc: "Key-value global con eventual consistency. Lecturas <10ms. Writes propagan en <60s. TTL configurable.",
    limits: [
      { label: "Key", value: "512 bytes" },
      { label: "Value", value: "25 MB" },
      { label: "Write rate", value: "~1/s por key" },
      { label: "Read latency", value: "<10ms" },
      { label: "Consistency", value: "Eventual ~60s" },
    ],
    pricing: "$0.50/M reads, $5.00/M writes",
    gotcha:
      "EVENTUAL consistency. NUNCA para balances, contadores, sesiones auth sensibles.",
    use: "Config, feature flags, cache HTTP, sesiones TTL corto.",
    notUse: "Contadores, balances, auth tokens, read-your-writes.",
    link: "https://developers.cloudflare.com/kv/",
    vs: [
      {
        title: "KV vs DO",
        body: "KV: eventual, global reads <10ms, simple. DO: strong consistency, actor con lógica. KV para config/cache, DO para estado mutable crítico.",
      },
      {
        title: "KV vs R2",
        body: "KV: values <25MB, key-value puro. R2: objects hasta 5TB, S3-compatible. KV para config pequeña, R2 para archivos.",
      },
    ],
  },

  r2: {
    id: "r2",
    name: "R2",
    cat: "storage",
    desc: "Object storage S3-compatible con CERO egress. URLs firmadas, event notifications, lifecycle rules. Data Catalog (Iceberg).",
    limits: [
      { label: "Object", value: "5 TB" },
      { label: "Buckets", value: "1000" },
      { label: "Egress", value: "$0" },
      { label: "S3 compat", value: "Sí" },
      { label: "Events", value: "Sí" },
    ],
    pricing: "$0.015/GB, $4.50/M Class A, $0 egress",
    gotcha:
      "Cero egress es el diferenciador. Para imágenes públicas combina con Cloudflare Images.",
    use: "Imágenes, videos, PDFs, backups, logs, checkpoints ML, Data Catalog.",
    notUse: "Datos estructurados pequeños (usa D1 o KV).",
    link: "https://developers.cloudflare.com/r2/",
    vs: [
      {
        title: "R2 vs S3",
        body: "R2: $0 egress (el killer feature), S3-compatible. S3: más integraciones AWS nativas. R2 ahorra 50-80% en egress-heavy workloads.",
      },
      {
        title: "R2 vs KV",
        body: "R2: archivos grandes, S3 API. KV: key-value <25MB, lecturas ultra-rápidas. R2 para media/blobs, KV para config.",
      },
    ],
  },

  queues: {
    id: "queues",
    name: "Queues",
    cat: "compute",
    desc: "Mensajería at-least-once. Dedupe opcional, batching, retries, dead-letter queues. Reemplaza SQS/Kafka.",
    limits: [
      { label: "Message", value: "128 KB" },
      { label: "Batch", value: "100 msgs" },
      { label: "Retention", value: "4 días" },
      { label: "Throughput", value: "~5K msg/s" },
      { label: "Delivery", value: "At-least-once" },
    ],
    pricing: "$0.40/M messages",
    gotcha:
      "At-least-once = consumer DEBE ser idempotente. Sin idempotencia = doble cobro.",
    use: "Async processing, webhooks, job queues, event fan-out.",
    notUse: "Ordering estricto global. Real-time streaming <50ms.",
    link: "https://developers.cloudflare.com/queues/",
    vs: [
      {
        title: "Queues vs Workflows",
        body: "Queues: fire-and-forget, batching, alto throughput. Workflows: multi-paso durable, signals HITL, compensación. Queues para jobs simples, Workflows para sagas.",
      },
      {
        title: "Queues vs SQS/Kafka",
        body: "Queues: nativo Workers, sin infraestructura. SQS: más integraciones AWS. Kafka: ordering, replay. Queues gana en simplicidad edge-native.",
      },
    ],
  },

  workflows: {
    id: "workflows",
    name: "Workflows",
    cat: "compute",
    desc: "Ejecución durable multi-paso. Steps persistentes, retries, sleep, signals HITL, compensación saga.",
    limits: [
      { label: "Steps", value: "Ilimitados" },
      { label: "Sleep", value: "Hasta 1 año" },
      { label: "Signals", value: "Sí (HITL)" },
      { label: "Saga", value: "Sí" },
      { label: "Concurrency", value: "Configurable" },
    ],
    pricing: "Workers pricing (CPU per step)",
    gotcha:
      "Cada step es invocación separada. No compartas estado mutable sin persistir.",
    use: "Flujos de pago, onboarding multi-paso, dunning, pipelines que sobreviven reinicios.",
    notUse: "Un solo paso (usa Queue). Real-time. Background trivial (usa Cron).",
    link: "https://developers.cloudflare.com/workflows/",
    vs: [
      {
        title: "Workflows vs Queues",
        body: "Workflows: pasos durables, sleep largo, HITL, sagas. Queues: mensajes simples, batching. Workflows para flujos complejos, Queues para jobs fire-and-forget.",
      },
      {
        title: "Workflows vs Step Functions",
        body: "Workflows: código TypeScript, edge-native, sin JSON/YAML. Step Functions: ecosistema AWS, visual designer. Workflows gana en DX.",
      },
    ],
  },

  vectorize: {
    id: "vectorize",
    name: "Vectorize",
    cat: "ai",
    desc: "Vector DB para memoria semántica. Embeddings + metadata filtering + namespaces multi-tenant.",
    limits: [
      { label: "Dims", value: "Hasta 1536" },
      { label: "Vectors", value: "Millones" },
      { label: "Metadata", value: "Sí" },
      { label: "Namespaces", value: "Sí" },
      { label: "Latency", value: "20-50ms" },
    ],
    pricing: "$0.01/M vectors/mes, $0.01/M queries",
    gotcha:
      "Embeddings de dominios mezclados sin namespace dan ruido. Siempre usa reranking post-retrieval.",
    use: "Memoria de agentes, similarity search, RAG, recomendaciones.",
    notUse: "Keyword search exacto (BM25). Datos tabulares (D1).",
    link: "https://developers.cloudflare.com/vectorize/",
    vs: [
      {
        title: "Vectorize vs AI Search",
        body: "Vectorize: vector DB puro, control total del pipeline. AI Search: managed RAG (ingesta + hybrid retrieval + reranking). Vectorize para pipelines custom, AI Search para RAG rápido.",
      },
      {
        title: "Vectorize vs Pinecone",
        body: "Vectorize: integración nativa Workers, sin egress. Pinecone: más features (sparse vectors, collections). Vectorize gana en edge-native + costo.",
      },
    ],
  },

  workersAI: {
    id: "workersAI",
    name: "Workers AI",
    cat: "ai",
    desc: "Inferencia de modelos open-source en GPUs de CF. Llama, Mistral, CLIP, Whisper. Structured outputs, tool calling.",
    limits: [
      { label: "Models", value: "50+" },
      { label: "Latency", value: "200-800ms" },
      { label: "Structured", value: "Sí" },
      { label: "Tool calling", value: "Sí" },
      { label: "Billing", value: "Por token" },
    ],
    pricing: "Varía. Llama 3.1 8B: ~$0.01/M input tokens",
    gotcha:
      "No tiene frontier models (usa Claude). Catálogo cambia semanalmente.",
    use: "Clasificación, moderación, embeddings, transcripción, imágenes.",
    notUse: "Razonamiento complejo (Claude). Fine-tuning (Modal). Modelos >70B.",
    link: "https://developers.cloudflare.com/workers-ai/",
    vs: [
      {
        title: "Workers AI vs Claude API",
        body: "Workers AI: open-source, edge, barato, embeddings/clasificación. Claude: frontier reasoning, tool use avanzado, contextos 200K. Workers AI para volumen/clasificación, Claude para razonamiento.",
      },
      {
        title: "Workers AI vs OpenAI API",
        body: "Workers AI: edge-native, modelos open-source, sin egress. OpenAI: GPT-4, DALL-E, Whisper hosted. Workers AI para tareas estándar baratas. Ambos vía AI Gateway.",
      },
    ],
  },

  aiGateway: {
    id: "aiGateway",
    name: "AI Gateway",
    cat: "ai",
    desc: "Proxy unificado para 14+ LLM providers. Caching, rate limiting, guardrails, fallback, cost attribution.",
    limits: [
      { label: "Providers", value: "14+" },
      { label: "Caching", value: "30-70% savings" },
      { label: "Guardrails", value: "PII, injection, toxicidad" },
      { label: "Fallback", value: "Auto" },
      { label: "Logging", value: "Opt-in" },
    ],
    pricing: "Gratuito",
    gotcha:
      "Sin esto, costo se escapa y observabilidad es ciega. No es opcional en producción.",
    use: "SIEMPRE que llames a un LLM en producción.",
    notUse: "No hay razón para NO usarlo.",
    link: "https://developers.cloudflare.com/ai-gateway/",
    vs: [
      {
        title: "AI Gateway vs directo al provider",
        body: "Gateway: caching (30-70% ahorro), fallback automático, guardrails, cost tracking. Directo: 0 overhead. Gateway es obligatorio en producción por ahorro y observabilidad.",
      },
    ],
  },

  access: {
    id: "access",
    name: "Access",
    cat: "security",
    desc: "SSO zero-trust para tools internas. Email allowlist, MFA, device posture. Reemplaza Auth0/Okta para internal tools.",
    limits: [
      { label: "Users free", value: "50" },
      { label: "Policies", value: "Por dominio+path" },
      { label: "MFA", value: "Sí" },
      { label: "Session TTL", value: "Configurable" },
      { label: "Audit", value: "Sí" },
    ],
    pricing: "Gratis hasta 50 users, $7/user después",
    gotcha:
      "Vendor lock-in real. Setup 20 min vs semanas con Auth0. Revisar si equipo >50.",
    use: "Dashboards internos, admin panels, staging URLs.",
    notUse: "Auth de usuarios finales de SaaS. Escenarios >50 users sin budget.",
    link: "https://developers.cloudflare.com/cloudflare-one/policies/access/",
    vs: [
      {
        title: "Access vs Auth0",
        body: "Access: 20 min setup, zero-trust, gratis <50 users. Auth0: más customizable, SDKs para SaaS, social login. Access para internal tools, Auth0 para SaaS consumer-facing.",
      },
      {
        title: "Access vs Clerk",
        body: "Access: zero-trust internal. Clerk: auth SaaS con UI components. Nunca Access para auth de usuarios finales.",
      },
    ],
  },

  tunnel: {
    id: "tunnel",
    name: "Tunnel",
    cat: "security",
    desc: "Conexión saliente encriptada desde on-prem/VPC sin abrir puertos. cloudflared binario.",
    limits: [
      { label: "Protocols", value: "HTTP, TCP, UDP" },
      { label: "Endpoints", value: "Ilimitados" },
      { label: "Auth", value: "Vía Access" },
      { label: "Cost", value: "Gratuito" },
      { label: "Setup", value: "cloudflared" },
    ],
    pricing: "Gratuito",
    gotcha:
      "Requiere instalar cloudflared. Dependencia de uptime de CF.",
    use: "Exponer DB privada, ERP on-prem, servicios en VPC. SSH sin VPN.",
    notUse: "Servicios ya en Workers (no necesitan tunnel).",
    link: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/",
    vs: [
      {
        title: "Tunnel vs VPN",
        body: "Tunnel: zero-trust, sin puertos abiertos, per-service access. VPN: acceso a red completa, más ataque surface. Tunnel siempre preferible para servicios específicos.",
      },
    ],
  },

  agentsSDK: {
    id: "agentsSDK",
    name: "Agents SDK + Think",
    cat: "ai",
    desc: "Framework para agentes long-running. Clase TypeScript sobre DO. Think: fibers, sub-agents, execution ladder 5 tiers, self-authored extensions.",
    limits: [
      { label: "Tiers", value: "5 niveles" },
      { label: "Sub-agents", value: "Ilimitados" },
      { label: "Persistence", value: "Auto (DO)" },
      { label: "HITL", value: "Nativo" },
      { label: "Token savings", value: "Hasta 99.9%" },
    ],
    pricing: "Workers pricing (DO + CPU)",
    gotcha:
      "API experimental (abril 2026). El patrón 'programa vs tool calls' requiere eval obligatorio.",
    use: "Agentes productivos con persistencia, sub-agents, sandboxed execution.",
    notUse: "Chatbots sin tools (Claude API directo). Prototipos rápidos.",
    link: "https://developers.cloudflare.com/agents/",
    vs: [
      {
        title: "Agents SDK vs LangChain",
        body: "Agents SDK: edge-native, DO persistence, HITL nativo, 5-tier execution. LangChain: más integraciones, Python. Agents SDK para producción en CF, LangChain para prototipado.",
      },
      {
        title: "Agents SDK vs Claude directo",
        body: "Claude directo: stateless, simple. Agents SDK: persistencia, sub-agents, HITL, tool orchestration. SDK cuando necesitas estado entre turnos.",
      },
    ],
  },

  aiSearch: {
    id: "aiSearch",
    name: "AI Search",
    cat: "ai",
    desc: "Búsqueda managed para agentes. Hybrid retrieval (BM25 + vector), relevance boosting, file upload.",
    limits: [
      { label: "Instances", value: "Dinámicas" },
      { label: "Files", value: "PDF, MD, HTML, TXT" },
      { label: "Retrieval", value: "Hybrid" },
      { label: "Reranking", value: "Sí" },
      { label: "Multi-instance", value: "Sí" },
    ],
    pricing: "Workers AI pricing",
    gotcha:
      "Evolución de AutoRAG. Si ya tienes pipeline manual, evalúa si AI Search simplifica sin perder control.",
    use: "RAG sobre docs, búsqueda semántica, Q&A, chatbot informativo.",
    notUse: "Full-text simple (D1 FTS). Analytics queries (Data Catalog).",
    link: "https://developers.cloudflare.com/ai-search/",
    vs: [
      {
        title: "AI Search vs Vectorize manual",
        body: "AI Search: ingesta, chunking, retrieval, reranking, todo managed. Vectorize: control total, pipeline custom. AI Search para RAG rápido, Vectorize para pipelines especializados.",
      },
      {
        title: "AI Search vs Algolia",
        body: "AI Search: edge-native, hybrid BM25+vector, integrado CF. Algolia: más UI components, analytics. AI Search para RAG/agentes, Algolia para search UX.",
      },
    ],
  },

  emailService: {
    id: "emailService",
    name: "Email Service",
    cat: "integration",
    desc: "Email Routing (entrante) + Sending (saliente transaccional) unificados. SDK tipado nativo Workers.",
    limits: [
      { label: "Sending", value: "Transaccional" },
      { label: "Receiving", value: "Email Workers" },
      { label: "Domains", value: "Custom" },
      { label: "Auth", value: "DKIM, SPF, DMARC auto" },
      { label: "Status", value: "Public beta" },
    ],
    pricing: "Routing gratis. Sending TBD (beta)",
    gotcha:
      "Public beta. No para marketing masivo. Deliverability depende de domain reputation.",
    use: "Recibos, confirmaciones, intake de correo, agentes que responden emails.",
    notUse: "Email marketing masivo (Mailchimp). Newsletters (ConvertKit).",
    link: "https://blog.cloudflare.com/email-for-agents/",
    vs: [
      {
        title: "Email Service vs SendGrid",
        body: "Email Service: edge-native, Workers SDK, gratis routing. SendGrid: más templates, analytics, deliverability tools. Email Service para transaccional simple, SendGrid para marketing.",
      },
    ],
  },

  artifacts: {
    id: "artifacts",
    name: "Artifacts",
    cat: "storage",
    desc: "Git-compatible versioned storage para agentes. Millones de repos, fork desde remote, clientes Git estándar.",
    limits: [
      { label: "Repos", value: "Millones" },
      { label: "Git", value: "Compatible" },
      { label: "Fork", value: "Desde cualquier remote" },
      { label: "API", value: "REST + Git protocol" },
      { label: "Status", value: "Beta" },
    ],
    pricing: "TBD (beta)",
    gotcha: "Beta. No reemplaza GitHub para collaboration humana.",
    use: "Code storage para agentes, apps generadas por IA, backup versionado.",
    notUse: "Collaboration humana (GitHub). Documentación (R2/Pages).",
    link: "https://blog.cloudflare.com/artifacts-git-for-agents-beta/",
    vs: [
      {
        title: "Artifacts vs GitHub",
        body: "Artifacts: millones de repos por agente, API-first. GitHub: colaboración humana, CI/CD, PRs. Artifacts para agentes, GitHub para humanos.",
      },
    ],
  },

  browserRun: {
    id: "browserRun",
    name: "Browser Run",
    cat: "compute",
    desc: "Chrome headless en edge. Live View, HITL (handover humano), Session Recordings (rrweb), CDP directo, 4x concurrencia.",
    limits: [
      { label: "Concurrency", value: "4x vs legacy" },
      { label: "HITL", value: "Sí" },
      { label: "Recordings", value: "Sí (rrweb)" },
      { label: "CDP", value: "WebSocket" },
      { label: "Session", value: "Configurable" },
    ],
    pricing: "Browser Rendering pricing",
    gotcha:
      "Diseñado para agentes con handover humano, no scraping genérico.",
    use: "Scraping con JS, screenshots, PDF gen, automatización web con auth humana.",
    notUse: "Fetch de APIs (usa fetch). Scraping simple sin JS.",
    link: "https://developers.cloudflare.com/browser-rendering/",
    vs: [
      {
        title: "Browser Run vs Puppeteer/Playwright",
        body: "Browser Run: edge, HITL nativo, recordings, managed. Puppeteer: control total, local/CI. Browser Run para agentes en producción, Puppeteer para testing local.",
      },
    ],
  },

  pages: {
    id: "pages",
    name: "Pages",
    cat: "compute",
    desc: "Hosting de sitios estáticos/SPAs. Deploy desde Git. Preview URLs por branch. Functions (Workers) integradas.",
    limits: [
      { label: "Builds", value: "500/mes free" },
      { label: "Bandwidth", value: "Ilimitado" },
      { label: "Domains", value: "Ilimitados" },
      { label: "Preview", value: "Por branch/PR" },
      { label: "Functions", value: "Sí" },
    ],
    pricing: "Gratuito",
    gotcha: "Para frontends. APIs puras → Workers directo.",
    use: "Landings, dashboards frontend, SPAs, docs.",
    notUse: "APIs puras (Workers). Backend (Workers + Queues/DO).",
    link: "https://developers.cloudflare.com/pages/",
    vs: [
      {
        title: "Pages vs Vercel",
        body: "Pages: bandwidth ilimitado gratis, edge functions = Workers. Vercel: Next.js nativo, mejor DX React. Pages para SPA/static, Vercel para Next.js fullstack.",
      },
      {
        title: "Pages vs Netlify",
        body: "Pages: CF ecosystem, Workers functions. Netlify: más plugins, forms built-in. Pages gana en bandwidth gratis + Workers integration.",
      },
    ],
  },

  hyperdrive: {
    id: "hyperdrive",
    name: "Hyperdrive",
    cat: "storage",
    desc: "Connection pool para Postgres externo (Supabase, Neon, PlanetScale). Elimina cold starts. Smart Placement.",
    limits: [
      { label: "Databases", value: "Postgres, MySQL" },
      { label: "Connections", value: "Pool managed" },
      { label: "Latency", value: "30-50% reduction" },
      { label: "Query cache", value: "Sí" },
      { label: "Placement", value: "Automático" },
    ],
    pricing: "Gratuito",
    gotcha:
      "No elimina latencia física al DC del DB. Combinar con D1 cache para reads frecuentes.",
    use: "Postgres externo que no migras. Bridge edge-Workers a DB centralizado.",
    notUse: "DB en D1 (no necesitas pool). 10 queries/día (overhead no paga).",
    link: "https://developers.cloudflare.com/hyperdrive/",
    vs: [
      {
        title: "Hyperdrive vs PgBouncer",
        body: "Hyperdrive: managed, smart placement, edge-aware. PgBouncer: self-hosted, más control. Hyperdrive para Workers, PgBouncer para infra propia.",
      },
    ],
  },

  analyticsEngine: {
    id: "analyticsEngine",
    name: "Analytics Engine",
    cat: "storage",
    desc: "Time-series DB optimizado para eventos de alto volumen. writeDataPoint() desde Workers. SQL queries con filtros temporales. Sampling automático.",
    limits: [
      { label: "Write rate", value: "25 escrituras/s por Worker invocation" },
      { label: "Blobs", value: "20 por datapoint" },
      { label: "Doubles", value: "20 por datapoint" },
      { label: "Retention", value: "90 días (free) / custom (paid)" },
      { label: "Query", value: "SQL sobre HTTP API" },
    ],
    pricing: "Gratuito en free tier. Paid: $0.25/M datapoints escritos",
    gotcha:
      "No es Postgres. Schema implícito (blobs + doubles + indexes). Diseña datapoints con cuidado porque no hay ALTER TABLE.",
    use: "Métricas custom, analytics de producto, latency tracking, event counters, dashboards operacionales.",
    notUse:
      "Datos relacionales (D1). Time-series >90 días en free (archiva a R2). Queries complejos con joins.",
    link: "https://developers.cloudflare.com/analytics/analytics-engine/",
    vs: [
      {
        title: "Analytics Engine vs D1",
        body: "Analytics Engine: time-series optimizado, alto throughput writes, sampling. D1: SQL relacional, joins, <1K writes/s. AE para métricas/eventos, D1 para datos relacionales.",
      },
      {
        title: "Analytics Engine vs Datadog/Grafana",
        body: "AE: edge-native, $0 en free tier, SQL queries. Datadog: dashboards avanzados, alertas, APM. AE para métricas custom baratas, Datadog para observabilidad enterprise.",
      },
    ],
  },

  workersCalls: {
    id: "workersCalls",
    name: "Workers Calls",
    cat: "compute",
    desc: "WebRTC SFU (Selective Forwarding Unit) en edge. Audio/video en tiempo real con baja latencia. WHIP/WHEP, rooms, tracks.",
    limits: [
      { label: "Protocol", value: "WebRTC (WHIP/WHEP)" },
      { label: "Latency", value: "<200ms P95" },
      { label: "Rooms", value: "Dinámicas" },
      { label: "Tracks", value: "Audio + Video" },
      { label: "Recording", value: "A R2" },
    ],
    pricing: "$0.05/1000 track-minutes",
    gotcha:
      "WebRTC requiere STUN/TURN. Workers Calls maneja SFU pero el cliente necesita WebRTC-compatible browser. No es telefonía PSTN.",
    use: "Llamadas de voz/video, conferencias, live streaming, agentes de voz en tiempo real.",
    notUse:
      "Telefonía PSTN (necesitas Twilio/Vonage). Audio offline (usa R2 + Workers AI Whisper).",
    link: "https://developers.cloudflare.com/calls/",
    vs: [
      {
        title: "Workers Calls vs Twilio",
        body: "Workers Calls: WebRTC SFU, edge-native, pricing por track-minute. Twilio: PSTN, más SDKs, telefonía real. Workers Calls para voz/video web, Twilio para llamadas telefónicas.",
      },
      {
        title: "Workers Calls vs LiveKit",
        body: "Workers Calls: CF edge, integración nativa. LiveKit: open-source, más features (egress, ingress). Workers Calls para simplicity, LiveKit para features avanzadas.",
      },
    ],
  },
}

/** All service IDs */
export const SERVICE_IDS = Object.keys(SERVICES)

/** All unique categories */
export const CATEGORIES = [...new Set(Object.values(SERVICES).map((s) => s.cat))] as const
