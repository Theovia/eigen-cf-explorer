export function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('eigen-theme') as 'dark' | 'light') || 'dark'
}

export function setTheme(theme: 'dark' | 'light') {
  if (typeof window === 'undefined') return
  localStorage.setItem('eigen-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme(): 'dark' | 'light' {
  const current = getTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
