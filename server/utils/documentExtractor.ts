// server/utils/documentExtractor.ts
import * as mammoth from 'mammoth';
import { PDFExtract } from 'pdf.js-extract';

const pdfExtract = new PDFExtract();

export async function extractDocumentContent(url: string, tipo: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (tipo.includes('pdf')) {
      const data = await pdfExtract.extractBuffer(buffer);
      return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
    } else if (tipo.includes('document') || tipo.includes('sheet') || tipo.includes('presentation')) {
      // Usamos mammoth para Word, Excel y PowerPoint
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    return `Contenido no extraíble para el tipo: ${tipo}`;
  } catch (error) {
    console.error('Error al extraer contenido:', error);
    return `Error al procesar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
}