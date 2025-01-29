import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  if (event.node.req.method === 'POST' && event.node.req.url?.includes('/api/asignaturas') && event.node.req.url?.includes('/materiales')) {
    event.node.req.headers['content-type'] = 'multipart/form-data'
  }
})