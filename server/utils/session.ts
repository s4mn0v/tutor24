// server/utils/session.ts

import type { SessionConfig } from 'h3'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}

export const sessionConfig: SessionConfig = {
  password: process.env.JWT_SECRET,
  name: 'nuxt-session',
  maxAge: 60 * 60 * 24 * 7, // 1 semana
}