import type { Decision } from "./types.ts"

export const DECISIONS: Decision[] = [
  {
    question: "¿Qué necesitas almacenar?",
    options: [
      {
        label: "Datos relacionales con SQL",
        desc: "Tablas, joins, queries",
        result: "d1",
        explanation:
          "D1: SQLite edge con SQL completo. Si necesitas >10GB o extensiones, Postgres + Hyperdrive.",
      },
      {
        label: "Estado por entidad (user, session)",
        desc: "Strong consistency, un writer",
        result: "durableObjects",
        explanation:
          "DO: actor pattern, un DO por entidad, strong consistency sin race conditions.",
      },
      {
        label: "Config global / feature flags",
        desc: "Lecturas rápidas, cambios lentos",
        result: "kv",
        explanation:
          "KV: lecturas <10ms, propagación en <60s. Acepta eventual consistency.",
      },
      {
        label: "Archivos (imágenes, PDFs, videos)",
        desc: "Blobs de cualquier tamaño",
        result: "r2",
        explanation:
          "R2: S3-compatible, cero egress. URLs firmadas. Event notifications.",
      },
      {
        label: "Embeddings / búsqueda semántica",
        desc: "Vectores, similitud, RAG",
        result: "vectorize",
        explanation:
          "Vectorize para vector DB. AI Search para RAG managed sin pipeline manual.",
      },
      {
        label: "Código versionado de agentes",
        desc: "Millones de repos, Git",
        result: "artifacts",
        explanation:
          "Artifacts (beta): Git-compatible, millones de repos, built para agentes.",
      },
    ],
  },
  {
    question: "¿Qué procesamiento necesitas?",
    options: [
      {
        label: "Request-response HTTP",
        desc: "API, webhook, página",
        result: "workers",
        explanation: "Worker con fetch handler. El building block universal.",
      },
      {
        label: "Trabajo async confiable",
        desc: "Procesar después, reintentos",
        result: "queues",
        explanation:
          "Queue + Consumer. At-least-once con dedupe. Dead-letter para fallos.",
      },
      {
        label: "Pipeline multi-paso durable",
        desc: "Steps que sobreviven restart",
        result: "workflows",
        explanation:
          "Workflows: steps persistentes, signals HITL, saga compensation.",
      },
      {
        label: "Browser automation",
        desc: "Scraping, screenshots, PDF",
        result: "browserRun",
        explanation: "Browser Run: Chrome headless + HITL + recordings + CDP.",
      },
      {
        label: "Agente autónomo con persistencia",
        desc: "Long-running, sub-agents",
        result: "agentsSDK",
        explanation:
          "Agents SDK + Think: clase TypeScript sobre DO, execution ladder, sub-agents.",
      },
      {
        label: "Tarea programada (cron)",
        desc: "Cada X min/horas/días",
        result: "workers",
        explanation:
          "Worker + Cron Trigger. Hasta 1000 crons. Para timers por-entidad: DO Alarms.",
      },
    ],
  },
  {
    question: "¿Qué modelo de IA necesitas?",
    options: [
      {
        label: "Razonamiento complejo / frontier",
        desc: "Tool use avanzado, contextos largos",
        result: "aiGateway",
        explanation:
          "Claude vía AI Gateway. Prompt caching 10-20x savings. Guardrails inline.",
      },
      {
        label: "Clasificación / embeddings / barato",
        desc: "Alto volumen, bajo costo",
        result: "workersAI",
        explanation:
          "Workers AI: CLIP, Llama 8B, Whisper. Edge, predecible. Custom → Modal.",
      },
      {
        label: "RAG sobre documentos",
        desc: "Preguntas sobre docs del cliente",
        result: "aiSearch",
        explanation:
          "AI Search: ingesta auto, hybrid retrieval, reranking, integración nativa.",
      },
      {
        label: "Visión / OCR / imagen",
        desc: "Clasificar, extraer texto",
        result: "workersAI",
        explanation:
          "CLIP zero-shot. Claude multimodal para OCR robusto. Custom VLMs → Modal.",
      },
      {
        label: "Voz (STT/TTS)",
        desc: "Transcripción, síntesis",
        result: "workersAI",
        explanation:
          "Whisper en Workers AI/Containers. ElevenLabs/OpenAI TTS. Workers Calls WebRTC.",
      },
    ],
  },
]
