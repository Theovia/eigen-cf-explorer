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
import { CustomCursor } from '#/components/architecture/custom-cursor'
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

  const isLight = theme === 'light'

  return (
    <div className="grid grid-cols-[280px_1fr_340px] grid-rows-[auto_1fr_auto] h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Custom cursor -- only visible in flow canvas area */}
      <CustomCursor />
      {/* Header — minimal, authoritative */}
      <header className="col-span-3 flex flex-col">
        <div className="flex items-center gap-6 px-5 py-3"
          style={{
            background: isLight ? 'white' : '#0a0a0b',
            borderBottom: 'none',
            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
          }}
        >
          {/* Logo: "EIGEN" zinc-100 mono weight 700, dot in orange */}
          <h1 className="whitespace-nowrap">
            <span
              className="text-sm font-bold tracking-wider"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                color: isLight ? '#44403c' : '#f4f4f5',
                fontWeight: 700,
              }}
            >
              EIGEN
            </span>
            <span
              className="mx-1.5 text-xs"
              style={{ color: 'var(--accent)' }}
            >
              {'\u2022'}
            </span>
            <span
              className="text-xs font-medium tracking-wide"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                color: '#71717a',
              }}
            >
              CF Architecture Explorer
            </span>
          </h1>

          <button
            onClick={handleToggle}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              color: '#a1a1aa',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '14px',
              cursor: 'pointer',
              background: isLight ? 'var(--bg3)' : 'transparent',
              border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
              boxShadow: 'none',
            }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>

          {/* Tabs: zinc-500 default, hover zinc-300, active zinc-100 + bottom border 2px orange */}
          <nav className="flex gap-1 ml-auto">
            {tabs.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="
                  px-3.5 py-1.5 text-xs font-medium tracking-wide
                  transition-all duration-200
                "
                style={{
                  fontFamily: '"Chakra Petch", sans-serif',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderBottom: '2px solid transparent',
                  color: '#71717a',
                  borderRadius: 0,
                }}
                activeProps={{
                  className: 'px-3.5 py-1.5 text-xs font-medium tracking-wide',
                  style: isLight
                    ? {
                        fontFamily: '"Chakra Petch", sans-serif',
                        color: 'var(--accent)',
                        background: 'white',
                        border: '1px solid transparent',
                        borderBottom: '2px solid var(--accent)',
                        borderRadius: 0,
                      }
                    : {
                        fontFamily: '"Chakra Petch", sans-serif',
                        color: '#f4f4f5',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderBottom: '2px solid var(--accent)',
                        borderRadius: 0,
                      },
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Clean border line instead of glow */}
        <div className="header-glow-line" />
      </header>

      {/* Sidebar */}
      <aside
        className="overflow-hidden"
        style={{
          borderRight: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
          background: isLight ? 'var(--bg)' : 'transparent',
        }}
      >
        <Sidebar />
      </aside>

      {/* Main — tech grid background */}
      <main className="overflow-hidden tech-grid" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>

      {/* Inspector */}
      <aside
        className="overflow-hidden"
        style={{
          borderLeft: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
          background: isLight ? 'white' : 'transparent',
        }}
      >
        <Inspector />
      </aside>

      {/* Footer / Prompt bar */}
      <footer className="col-span-3">
        <PromptBar />
      </footer>
    </div>
  )
}
