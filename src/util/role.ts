import { Request, Response, NextFunction } from 'express'
import { UserDocument } from '../models/User'
import { ForbiddenError } from '../helpers/apiError'

const ROLES = {
  Admin: 'Admin',
  User: 'User',
} as const

export const checkIsInRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const hasRole = roles.find(
      (role) => (req.user as UserDocument).role === role
    )
    if (!hasRole) {
      next(new ForbiddenError())
    }

    return next()
  }

export default ROLES
