// server/utils/pdfParseWrapper.ts
import fs from 'fs';
import type { PathOrFileDescriptor } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let pdfParse: any;

function loadPdfParse() {
  if (!pdfParse) {
    console.log('Cargando pdf-parse');
    const originalReadFileSync = fs.readFileSync;
    (fs as any).readFileSync = function(path: PathOrFileDescriptor, options?: { encoding?: BufferEncoding | null, flag?: string } | BufferEncoding | null): string | Buffer {
      if (typeof path === 'string' && path.includes('05-versions-space.pdf')) {
        console.log('Interceptando intento de leer 05-versions-space.pdf');
        return Buffer.from('');
      }
      return originalReadFileSync.call(fs, path, options);
    };

    try {
      pdfParse = require('pdf-parse');
      console.log('pdf-parse cargado exitosamente');
    } catch (error) {
      console.error('Error al cargar pdf-parse:', error);
      throw error;
    } finally {
      (fs as any).readFileSync = originalReadFileSync;
      console.log('Restaurada función original readFileSync');
    }
  }
  return pdfParse;
}

export default loadPdfParse;