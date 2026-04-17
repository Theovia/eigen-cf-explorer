// Stub — will be replaced by data-agent with full decision tree
import type { Decision } from './types'

export const decisions: Decision[] = [
  {
    question: '¿Qué tipo de aplicación estás construyendo?',
    options: [
      {
        label: 'API / Backend',
        desc: 'REST o GraphQL API, microservicio, webhook handler.',
        result: 'workers,d1,kv',
        explanation: 'Workers como compute principal, D1 para datos relacionales, KV para cache y config.',
      },
      {
        label: 'Chatbot / AI',
        desc: 'Chatbot con contexto, RAG, o agente AI.',
        result: 'workers,ai,vectorize,d1,r2',
        explanation: 'Workers AI para inferencia, Vectorize para embeddings, R2 para documentos fuente.',
      },
      {
        label: 'SaaS Multi-tenant',
        desc: 'Plataforma con múltiples clientes/organizaciones.',
        result: 'workers,durable-objects,d1,queues,access',
        explanation: 'Durable Objects para aislamiento de tenant, D1 para datos, Access para auth zero-trust.',
      },
      {
        label: 'Sitio Web / Landing',
        desc: 'Sitio estático, blog, landing page con funciones.',
        result: 'pages,kv,r2',
        explanation: 'Pages para hosting + SSR, KV para datos dinámicos, R2 para media.',
      },
    ],
  },
  {
    question: '¿Qué tan crítica es la consistencia de datos?',
    options: [
      {
        label: 'Eventual consistency OK',
        desc: 'Datos pueden tardar segundos en sincronizar globalmente.',
        result: 'kv',
        explanation: 'KV ofrece lecturas ultra-rápidas con consistencia eventual (~60s). Ideal para cache y config.',
      },
      {
        label: 'Consistencia fuerte',
        desc: 'Las lecturas siempre ven la última escritura.',
        result: 'd1,durable-objects',
        explanation: 'D1 (SQL transaccional) o Durable Objects (estado aislado) garantizan consistencia fuerte.',
      },
      {
        label: 'Mix de ambos',
        desc: 'Datos críticos consistentes, resto eventual.',
        result: 'd1,kv',
        explanation: 'Patrón común: D1 para datos transaccionales, KV como cache layer.',
      },
    ],
  },
  {
    question: '¿Necesitas procesamiento asíncrono?',
    options: [
      {
        label: 'No, todo síncrono',
        desc: 'Request-response simple, sin jobs en background.',
        result: '',
        explanation: 'Workers manejan bien requests síncronos. Sin necesidad de queues.',
      },
      {
        label: 'Sí, jobs en background',
        desc: 'Emails, reportes, procesamiento de archivos.',
        result: 'queues',
        explanation: 'Queues desacopla el procesamiento. Worker encola, consumer procesa. At-least-once delivery.',
      },
      {
        label: 'Sí, real-time',
        desc: 'WebSockets, colaboración en vivo, eventos.',
        result: 'durable-objects',
        explanation: 'Durable Objects + WebSockets para estado real-time compartido entre conexiones.',
      },
    ],
  },
]
