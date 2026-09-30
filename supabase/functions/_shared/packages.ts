export const packages: Record<string, { name: string; pricePerPerson: number }> = {
  CG02: { name: 'Confraterniza Grill', pricePerPerson: 160 },
  CG03: { name: 'Celebração Grill', pricePerPerson: 160 },
  CG04: { name: '15 Anos Essencial', pricePerPerson: 160 },
  CG06: { name: 'Casamento Essencial', pricePerPerson: 160 },
}

export const extras: Record<string, { name: string; pricePerPerson?: number; fixedPrice?: number }> = {
  beverages: { name: 'Open Bar de Bebidas Não Alcoólicas', pricePerPerson: 18 },
  draft_beer: { name: 'Chopp Artesanal ou Cerveja Pilsen Premium', pricePerPerson: 32 },
  extra_dessert: { name: 'Mesa de Doces Finos e Sobremesas', pricePerPerson: 15 },
  extra_hour: { name: 'Hora Adicional de Buffet', fixedPrice: 1200 },
}

export const allowedGuestCounts = new Set([25, 50, 75, 100, 150, 200, 250, 300])

export function toCents(value: number): number {
  return Math.round(value * 100)
}

export function buildCheckoutItems(packageCode: string, guests: number, selectedExtras: string[]) {
  const selectedPackage = packages[packageCode]
  if (!selectedPackage) throw new Error('Pacote inválido.')

  const items = [
    {
      name: `${selectedPackage.name} - ${guests} pessoas`,
      description: `Pacote ${packageCode} do Concórdia Grill`,
      amount: toCents(selectedPackage.pricePerPerson * guests),
      default_quantity: 1,
    },
  ]

  for (const extraId of selectedExtras) {
    const extra = extras[extraId]
    if (!extra) throw new Error('Um dos opcionais selecionados é inválido.')
    const price = extra.fixedPrice ?? (extra.pricePerPerson! * guests)
    items.push({
      name: extra.name,
      description: `Opcional para ${guests} pessoas`,
      amount: toCents(price),
      default_quantity: 1,
    })
  }

  return items
}

export function calculateTotalCents(packageCode: string, guests: number, selectedExtras: string[]): number {
  return buildCheckoutItems(packageCode, guests, selectedExtras)
    .reduce((acc, item) => acc + item.amount * item.default_quantity, 0)
}

export function validateCheckoutRequest(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Dados do pedido inválidos.' }
  }

  const input = body as Record<string, unknown>
  const packageCode = typeof input.packageCode === 'string' ? input.packageCode.toUpperCase() : ''
  const guests = Number(input.guests)
  const selectedExtras = Array.isArray(input.selectedExtras) ? input.selectedExtras : []

  if (!packages[packageCode]) return { error: 'Pacote inválido.' }
  if (!Number.isInteger(guests) || !allowedGuestCounts.has(guests)) {
    return { error: 'Quantidade de convidados inválida.' }
  }
  if (
    selectedExtras.length > Object.keys(extras).length ||
    new Set(selectedExtras).size !== selectedExtras.length ||
    selectedExtras.some((id) => typeof id !== 'string' || !extras[id])
  ) {
    return { error: 'Lista de opcionais inválida.' }
  }

  return { packageCode, guests, selectedExtras: selectedExtras as string[] }
}
