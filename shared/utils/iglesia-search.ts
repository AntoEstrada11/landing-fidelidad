import type { IglesiaOption } from '#shared/types/iglesia'

export function filterIglesias(
  items: IglesiaOption[],
  query: string,
  limit = 8
): IglesiaOption[] {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) {
    return []
  }

  return items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.bloque.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

export function formatImporte(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(amount)
}
