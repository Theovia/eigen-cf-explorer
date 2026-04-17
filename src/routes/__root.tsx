import { useState, useEffect } from 'react'
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
import { getTheme, setTheme, toggleTheme } from '#/lib/theme'

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
        href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
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
      <body className="scanlines grain">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const tabs = [
  { to: '/architectures' as const, label: 'Arquitecturas' },
  { to: '/catalog' as const, label: 'Catalogo' },
  { to: '/decisions' as const, label: 'Decisiones' },
]

function RootComponent() {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = getTheme()
    setThemeState(saved)
    setTheme(saved)
  }, [])

  const handleToggle = () => {
    const next = toggleTheme()
    setThemeState(next)
  }

  return (
    <div className="grid grid-cols-[280px_1fr_340px] grid-rows-[auto_1fr_auto] h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <header className="col-span-3 flex flex-col">
        <div className="flex items-center gap-6 px-5 py-3 glass"
          style={{ borderBottom: 'none' }}
        >
          <h1 className="whitespace-nowrap" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
            <span className="text-sm font-bold tracking-wider text-glow-orange"
              style={{ color: 'var(--accent)' }}
            >
              EIGEN
            </span>
            <span className="mx-2 text-[var(--text3)]">/</span>
            <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--text3)' }}>
              CF Architecture Explorer
            </span>
          </h1>

          <button
            onClick={handleToggle}
            className="glass px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-105"
            style={{
              color: 'var(--text2)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '14px',
              cursor: 'pointer',
              border: '1px solid var(--glass-border)',
            }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>

          <nav className="flex gap-1 ml-auto">
            {tabs.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="
                  px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide
                  transition-all duration-200
                  text-[var(--text3)] hover:text-[var(--text)]
                "
                style={{
                  fontFamily: '"Chakra Petch", sans-serif',
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
                activeProps={{
                  className:
                    'px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide glow-orange',
                  style: {
                    fontFamily: '"Chakra Petch", sans-serif',
                    color: 'var(--accent)',
                    background: 'rgba(249, 115, 22, 0.08)',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                  },
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Animated glow line */}
        <div className="header-glow-line" />
      </header>

      {/* Sidebar */}
      <aside className="overflow-hidden glass" style={{ borderRight: '1px solid var(--glass-border)', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
        <Sidebar />
      </aside>

      {/* Main — tech grid background */}
      <main className="overflow-hidden tech-grid" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>

      {/* Inspector */}
      <aside className="overflow-hidden glass" style={{ borderLeft: '1px solid var(--glass-border)', borderTop: 'none', borderBottom: 'none', borderRight: 'none' }}>
        <Inspector />
      </aside>

      {/* Footer / Prompt bar */}
      <footer className="col-span-3">
        <PromptBar />
      </footer>
    </div>
  )
}
