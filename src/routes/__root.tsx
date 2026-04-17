import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { Sidebar } from '#/components/layout/sidebar'
import { Inspector } from '#/components/layout/inspector'
import { PromptBar } from '#/components/layout/prompt-bar'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Eigen CF Explorer' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const tabs = [
  { to: '/architectures' as const, label: 'Arquitecturas' },
  { to: '/catalog' as const, label: 'Catálogo' },
  { to: '/decisions' as const, label: 'Decisiones' },
]

function RootComponent() {
  return (
    <div className="grid grid-cols-[280px_1fr_340px] grid-rows-[auto_1fr_auto] h-screen overflow-hidden bg-[var(--bg)]">
      {/* Header */}
      <header className="col-span-3 flex items-center gap-6 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg2)]">
        <h1 className="font-mono text-sm font-semibold tracking-wide whitespace-nowrap">
          <span className="text-[var(--accent)]">EIGEN</span>
          <span className="text-[var(--text3)] mx-1.5">&middot;</span>
          <span className="text-[var(--text2)]">CF Architecture Explorer</span>
        </h1>

        <nav className="flex gap-1 ml-auto">
          {tabs.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="
                px-3 py-1.5 rounded-lg text-xs font-mono
                transition-colors
                text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)]
              "
              activeProps={{
                className:
                  'px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--accent)] text-white',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Sidebar */}
      <aside className="border-r border-[var(--border)] bg-[var(--bg2)] overflow-hidden">
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="overflow-hidden bg-[var(--bg)]">
        <Outlet />
      </main>

      {/* Inspector */}
      <aside className="border-l border-[var(--border)] bg-[var(--bg2)] overflow-hidden">
        <Inspector />
      </aside>

      {/* Footer / Prompt bar */}
      <footer className="col-span-3">
        <PromptBar />
      </footer>
    </div>
  )
}
