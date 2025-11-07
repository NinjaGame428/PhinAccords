/**
 * PhinAccords PDF Export Utility
 * Heavenkeys Ltd
 * 
 * Export chord sheets to PDF format
 */

import jsPDF from 'jspdf'

export interface ChordSegment {
  startTime: number
  endTime: number
  chord: string
  confidence?: number
}

export interface PDFExportOptions {
  title?: string
  artist?: string
  key?: string
  tempo?: number
  timeSignature?: string
  includeChords?: boolean
  includeLyrics?: boolean
  lyrics?: string
}

/**
 * Export chord progression to PDF
 */
export async function exportPDF(
  chords: ChordSegment[],
  options: PDFExportOptions = {}
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Title
  if (options.title) {
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title, margin, yPosition)
    yPosition += 10
  }

  // Artist
  if (options.artist) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`by ${options.artist}`, margin, yPosition)
    yPosition += 8
  }

  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const metadata: string[] = []
  if (options.key) metadata.push(`Key: ${options.key}`)
  if (options.tempo) metadata.push(`Tempo: ${options.tempo} BPM`)
  if (options.timeSignature) metadata.push(`Time: ${options.timeSignature}`)
  
  if (metadata.length > 0) {
    doc.text(metadata.join(' • '), margin, yPosition)
    yPosition += 8
  }

  // Separator line
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Chord progression
  if (options.includeChords !== false) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Chord Progression:', margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    let chordLine = ''
    let lineWidth = 0
    const maxWidth = contentWidth - 10

    for (const chord of chords) {
      const chordText = `${chord.chord} `
      const textWidth = doc.getTextWidth(chordText)

      if (lineWidth + textWidth > maxWidth && chordLine.length > 0) {
        // Start new line
        doc.text(chordLine.trim(), margin, yPosition)
        yPosition += 6
        chordLine = chordText
        lineWidth = textWidth

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
      } else {
        chordLine += chordText
        lineWidth += textWidth
      }
    }

    // Add remaining chords
    if (chordLine.trim().length > 0) {
      doc.text(chordLine.trim(), margin, yPosition)
      yPosition += 10
    }
  }

  // Lyrics (if provided)
  if (options.includeLyrics && options.lyrics) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Lyrics:', margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const lyrics = options.lyrics.split('\n')
    for (const line of lyrics) {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += 6
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `PhinAccords - Heavenkeys Ltd | Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 10
    )
  }

  // Download PDF
  const filename = options.title
    ? `${options.title.replace(/[^a-z0-9]/gi, '_')}_chords.pdf`
    : 'chords.pdf'
  
  doc.save(filename)
}

/**
 * Export chord sheet with timing information
 */
export async function exportPDFWithTiming(
  chords: ChordSegment[],
  options: PDFExportOptions = {}
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Title
  if (options.title) {
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title, margin, yPosition)
    yPosition += 10
  }

  // Artist
  if (options.artist) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`by ${options.artist}`, margin, yPosition)
    yPosition += 8
  }

  // Metadata
  doc.setFontSize(10)
  const metadata: string[] = []
  if (options.key) metadata.push(`Key: ${options.key}`)
  if (options.tempo) metadata.push(`Tempo: ${options.tempo} BPM`)
  if (options.timeSignature) metadata.push(`Time: ${options.timeSignature}`)
  
  if (metadata.length > 0) {
    doc.text(metadata.join(' • '), margin, yPosition)
    yPosition += 10
  }

  // Separator
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Chord progression with timing
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Chord Progression (with timing):', margin, yPosition)
  yPosition += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  for (const chord of chords) {
    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    const timeText = `${chord.startTime.toFixed(1)}s - ${chord.endTime.toFixed(1)}s`
    const chordText = chord.chord

    doc.setFont('helvetica', 'bold')
    doc.text(chordText, margin, yPosition)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`(${timeText})`, margin + 20, yPosition)
    
    yPosition += 6
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `PhinAccords - Heavenkeys Ltd | Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 10
    )
  }

  const filename = options.title
    ? `${options.title.replace(/[^a-z0-9]/gi, '_')}_chords.pdf`
    : 'chords.pdf'
  
  doc.save(filename)
}

