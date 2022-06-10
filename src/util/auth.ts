import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { JWT_SECRET } from './secrets'

export const verifyPassword = async (
  password: string,
  truePassword: string
) => {
  return await bcrypt.compare(password, truePassword)
}
export const jwtGenerator = (email: string) =>
  jwt.sign({ email }, JWT_SECRET, {
    expiresIn: 60 * 60 * 4, //seconds, expire in 4 hours
  })
