import ExcelJS from 'exceljs'
import { PDFExtract } from 'pdf.js-extract'
import mammoth from 'mammoth'
import { promises as fs } from 'fs'
import { getFileExtension } from '~/server/utils/fileUtils'

export async function convertFile(filePath: string, originalFilename: string) {
  const fileExtension = getFileExtension(originalFilename)

  try {
    switch (fileExtension) {
      case 'xlsx':
        return await convertExcel(filePath)
      case 'pdf':
        return await convertPDF(filePath)
      case 'docx':
      case 'doc':
        return await convertWord(filePath)
      default:
        throw new Error('Formato de archivo no soportado')
    }
  } finally {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Error eliminando archivo temporal:', error)
    }
  }
}

async function convertExcel(filePath: string) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  
  const result: any[] = []
  workbook.worksheets.forEach(worksheet => {
    const sheetData: any[] = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Primera fila como encabezados
        const headers = row.values as string[]
        sheetData.push(headers)
      } else {
        // Datos de las filas
        sheetData.push(row.values)
      }
    })
    result.push({
      sheetName: worksheet.name,
      data: sheetData
    })
  })

  return result
}

async function convertPDF(filePath: string) {
  const pdfExtract = new PDFExtract()
  const data = await pdfExtract.extract(filePath)
  
  return {
    numPages: data.pages.length,
    pages: data.pages.map((page, index) => ({
      pageNumber: index + 1,
      content: page.content.map(item => item.str).join(' '),
      rawContent: page.content
    }))
  }
}

async function convertWord(filePath: string) {
  const result = await mammoth.extractRawText({ path: filePath })
  return {
    content: result.value,
    messages: result.messages
  }
}