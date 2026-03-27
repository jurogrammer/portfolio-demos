export async function callN8nWebhook(path: string, data: Record<string, unknown>) {
  const baseUrl = process.env.N8N_WEBHOOK_URL
  if (!baseUrl) throw new Error('N8N_WEBHOOK_URL not configured')

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`n8n webhook failed: ${response.status}`)
  }

  return response.json()
}
