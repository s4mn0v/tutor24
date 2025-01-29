import { promises as fs } from 'fs'
import { join } from 'path'

export async function ensureUploadDirectory() {
  const uploadDir = join(process.cwd(), 'uploads')
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }
  return uploadDir
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}