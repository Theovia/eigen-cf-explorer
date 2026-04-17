// Stub — will be replaced by data-agent with full prompt builder
import type { Architecture, Service, TrafficParams } from '#/data/types'

export function buildPrompt(params: {
  arch: Architecture | null
  services: Service[]
  traffic: TrafficParams
  selectedServices?: string[]
}): string {
  const { arch, services, traffic, selectedServices } = params

  const lines: string[] = []

  lines.push('=== Cloudflare Architecture Prompt ===')
  lines.push('')

  if (arch) {
    lines.push(`Arquitectura: ${arch.name}`)
    lines.push(`Descripción: ${arch.desc}`)
    lines.push(`Servicios: ${arch.services.join(', ')}`)
    lines.push(`Flow: ${arch.flow}`)
    lines.push('')
  }

  lines.push('--- Parámetros de tráfico ---')
  lines.push(`Requests/día: ${traffic.rps.toLocaleString()}`)
  lines.push(`Storage: ${traffic.storage} GB`)
  lines.push(`AI calls/día: ${traffic.aiCalls.toLocaleString()}`)
  lines.push(`Tenants: ${traffic.tenants}`)
  lines.push('')

  if (selectedServices && selectedServices.length > 0) {
    lines.push('--- Servicios seleccionados ---')
    for (const id of selectedServices) {
      const svc = services.find((s) => s.id === id)
      if (svc) {
        lines.push(`• ${svc.name}: ${svc.desc}`)
        lines.push(`  Pricing: ${svc.pricing}`)
        lines.push(`  Gotcha: ${svc.gotcha}`)
      }
    }
  }

  return lines.join('\n')
}
