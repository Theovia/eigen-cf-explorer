import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import type { Service, ServiceLimit, VsComparison } from '#/data/types'

const catColors: Record<string, string> = {
  compute: 'bg-[var(--blue)]',
  storage: 'bg-[var(--green)]',
  ai: 'bg-[var(--purple)]',
  security: 'bg-[var(--red)]',
  integration: 'bg-[var(--cyan)]',
}

const catLabels: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  ai: 'AI',
  security: 'Security',
  integration: 'Integration',
}

export function Inspector() {
  const selectedService = useExplorerStore((s) => s.selectedService)

  const service: Service | null = selectedService
    ? SERVICES[selectedService] ?? null
    : null

  if (!service) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-sm text-[var(--text3)] text-center leading-relaxed">
          Haz click en un servicio para ver detalles
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-white/90 ${catColors[service.cat] ?? 'bg-[var(--text3)]'}`}
        >
          {catLabels[service.cat] ?? service.cat}
        </span>
        <h2 className="text-xl font-semibold mt-2 text-[var(--text)]">
          {service.name}
        </h2>
        <p className="text-sm text-[var(--text2)] mt-1 leading-relaxed">
          {service.desc}
        </p>
      </div>

      {/* Limits table */}
      {service.limits.length > 0 && (
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
            Limites
          </h4>
          <table className="w-full text-xs">
            <tbody>
              {service.limits.map((limit: ServiceLimit, i: number) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-1.5 text-[var(--text2)]">{limit.label}</td>
                  <td className="py-1.5 font-mono text-right text-[var(--text)]">
                    {limit.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
          Pricing
        </h4>
        <p className="text-sm font-mono text-[var(--accent)] leading-relaxed">
          {service.pricing}
        </p>
      </div>

      {/* When to use */}
      <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/5 p-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--green)] mb-1.5">
          Cuando usar
        </h4>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          {service.use}
        </p>
      </div>

      {/* When NOT to use */}
      <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red)]/5 p-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--red)] mb-1.5">
          Cuando NO usar
        </h4>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          {service.notUse}
        </p>
      </div>

      {/* Gotcha */}
      <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red)]/5 p-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--red)] mb-1.5">
          Gotcha
        </h4>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          {service.gotcha}
        </p>
      </div>

      {/* Vs comparisons */}
      {service.vs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)]">
            Comparaciones
          </h4>
          {service.vs.map((vs: VsComparison, i: number) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-3"
            >
              <h5 className="text-xs font-mono text-[var(--cyan)] mb-1">
                {vs.title}
              </h5>
              <p className="text-sm text-[var(--text2)] leading-relaxed">
                {vs.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Doc link */}
      <a
        href={service.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-mono text-[var(--accent)] hover:underline mt-auto pb-2"
      >
        Documentacion &rarr;
      </a>
    </div>
  )
}
