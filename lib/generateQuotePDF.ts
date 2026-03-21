import type { Quote } from './quotations'

/**
 * Generates a PDF from the live quote template DOM node.
 * Uses html2canvas to capture the template, then jsPDF to embed as A4.
 */
export async function generateQuotePDF(
  templateElementId: string,
  quote: Pick<Quote, 'quote_number' | 'client_name' | 'quote_date'>
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const element = document.getElementById(templateElementId)
  if (!element) {
    throw new Error(`Template element #${templateElementId} not found`)
  }

  // Capture the template to canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for crisp PDF
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth,
    height: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Scale image to fit A4 width
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = 0
  let remainingHeight = imgHeight

  // Add pages if content overflows
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  remainingHeight -= pageHeight

  while (remainingHeight > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    remainingHeight -= pageHeight
  }

  // Sanitized filename: QuoteNo_ClientName_Date.pdf
  const dateStr = quote.quote_date.replace(/-/g, '')
  const clientStr = (quote.client_name || 'Client').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
  const filename = `${quote.quote_number}_${clientStr}_${dateStr}.pdf`

  pdf.save(filename)
}
