import { Request, Response, NextFunction } from 'express'

import { Ban } from '../models/User'
import UserService from '../services/user'
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../helpers/apiError'

// POST /admin/ban_user
export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, reason, days } = req.body
    if (!userId || Number.isNaN(days)) {
      return next(new BadRequestError('Invalid Request'))
    }
    const ban: Ban = {
      reason,
      created: new Date(),
      expired: new Date(Date.now() + Number(days) * 24 * 3600 * 1000),
    }

    await UserService.ban(userId, ban)
    res.json(ban)
  } catch (error) {
    if (error.statusCode === 404) {
      next(new NotFoundError('User not found', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// GET /admin/unban_user/:userId
export const unbanUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedBan = await UserService.unBan(req.params.userId)

    res.json(updatedBan)
  } catch (error) {
    if (error.statusCode === 404) {
      next(new NotFoundError('User not found', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}
