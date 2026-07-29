import { prisma } from '../db/client'

export async function generateAssetReport(assetId: string, userId: string): Promise<Buffer> {
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, userId },
    include: {
      categories: true,
      financials: {
        include: { category: true, attachments: true },
        orderBy: { eventDate: 'asc' },
      },
      memories: { orderBy: { eventDate: 'asc' } },
    },
  })

  if (!asset) throw new Error('Patrimônio não encontrado')

  const totalInvested = asset.financials.reduce((sum, f) => sum + Number(f.amount), 0)

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 40px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
    .stat-row { display: flex; gap: 24px; margin-bottom: 32px; }
    .stat { background: #f9fafb; border-radius: 12px; padding: 16px 24px; flex: 1; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    h2 { font-size: 18px; font-weight: 600; margin: 32px 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 8px 12px; background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500; }
    .footer { margin-top: 48px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <h1>${asset.name}</h1>
  <p class="subtitle">Relatório gerado em ${new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>

  <div class="stat-row">
    <div class="stat">
      <div class="stat-label">Total Investido</div>
      <div class="stat-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Registros</div>
      <div class="stat-value">${asset.financials.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Memórias</div>
      <div class="stat-value">${asset.memories.length}</div>
    </div>
  </div>

  <h2>Histórico Financeiro</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${asset.financials.map((f) => `
        <tr>
          <td>${new Date(f.eventDate).toLocaleDateString('pt-BR')}</td>
          <td>${f.title}</td>
          <td>${f.category ? `<span class="badge" style="background:${f.category.color}20;color:${f.category.color}">${f.category.name}</span>` : '—'}</td>
          <td style="text-align:right;font-weight:500">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(f.amount))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">Patrimônio — Relatório gerado automaticamente</div>
</body>
</html>`

  return Buffer.from(html, 'utf-8')
}
