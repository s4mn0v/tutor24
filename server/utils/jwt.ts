// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

interface DecodedToken {
  userId: number
  role: string
  iat: number
  exp: number
}

export const verifyToken = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err: Error | null, decoded: unknown) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as DecodedToken)
      }
    })
  })
}