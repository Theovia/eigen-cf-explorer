import { createFileRoute } from '@tanstack/react-router'
import { CatalogGrid } from '#/components/catalog/catalog-grid'

export const Route = createFileRoute('/catalog')({ component: CatalogPage })

function CatalogPage() {
  return <CatalogGrid />
}
