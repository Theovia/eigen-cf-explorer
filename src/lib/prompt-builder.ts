import type { Architecture, Service, TrafficParams } from "#/data/types.ts"
import { calculateCost } from "./cost.ts"
import { formatNumber } from "./utils.ts"

/**
 * Build a comprehensive implementation prompt string from the current explorer state.
 *
 * Includes: architecture description, services, data flow, gotchas per service,
 * implementation steps, traffic constraints, and optionally the selected service detail.
 */
export function buildPrompt(
  arch: Architecture,
  services: Record<string, Service>,
  traffic: TrafficParams,
  selectedServiceId: string | null,
): string {
  const svcNames = arch.services.map((s) => services[s]?.name ?? s)
  const cost = calculateCost(arch, traffic)

  let p = "# Arquitectura: " + arch.name + "\n\n"

  // Description
  p += "## Descripción\n" + arch.desc + "\n\n"

  // Services
  p += "## Servicios Cloudflare\n" + svcNames.join(", ") + "\n\n"

  // Data flow
  p += "## Flujo de datos\n```\n" + arch.flow + "\n```\n\n"

  // Traffic constraints
  p += "## Restricciones de tráfico\n"
  p += "- " + formatNumber(traffic.rps) + " requests/día (" + formatNumber(traffic.rps * 30) + " /mes)\n"
  p += "- " + formatNumber(traffic.storage) + " GB almacenamiento\n"
  p += "- " + formatNumber(traffic.aiCalls) + " AI calls/día\n"
  p += "- " + traffic.tenants + " tenants\n"
  p += "- Costo estimado: $" + cost.toFixed(0) + " USD/mes\n\n"

  // Gotchas per service
  p += "## Gotchas por servicio\n"
  for (const sId of arch.services) {
    const svc = services[sId]
    if (svc) {
      p += "- **" + svc.name + "**: " + svc.gotcha + "\n"
    }
  }
  p += "\n"

  // Implementation steps
  if (arch.steps.length > 0) {
    p += "## Pasos de implementación\n"
    arch.steps.forEach((step, i) => {
      p += (i + 1) + ". " + step + "\n"
    })
    p += "\n"
  }

  // Selected service detail
  if (selectedServiceId && services[selectedServiceId]) {
    const sel = services[selectedServiceId]
    p += "## Servicio seleccionado: " + sel.name + "\n"
    p += "- Uso: " + sel.use + "\n"
    p +=
      "- Límites clave: " +
      sel.limits.map((l) => l.label + ": " + l.value).join(", ") +
      "\n"
    p += "- Pricing: " + sel.pricing + "\n\n"
  }

  // Closing instruction
  p +=
    "---\nImplementa esta arquitectura paso a paso en Cloudflare Workers (TypeScript). Usa wrangler para el setup. Cada paso debe ser funcional y testeable antes de pasar al siguiente."

  return p
}
