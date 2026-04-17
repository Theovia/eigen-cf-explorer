import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
        Eigen CF Explorer
      </h1>
      <p style={{ color: 'var(--text2)' }}>
        Cloudflare Architecture Explorer — ready to build.
      </p>
    </div>
  )
}
