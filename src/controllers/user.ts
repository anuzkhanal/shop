import { Request, Response, NextFunction } from 'express'
import passport from 'passport'

import UserService from '../services/user'
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../helpers/apiError'
import { UserDocument } from '../models/User'
import { jwtGenerator } from '../util/auth'

// GET /users/
export const getUser = async (req: Request, res: Response) => {
  const user = req.user as UserDocument
  user.password = undefined
  res.json({ user: req.user })
}

// GET /users/all
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, firstName, lastName, email, rowsPerPage, sort } = req.query
    res.json(
      await UserService.findAllUsers(
        page ? Number(page) : 1,
        rowsPerPage ? Number(rowsPerPage) : 10,
        firstName as string | undefined,
        lastName as string | undefined,
        email as string | undefined,
        sort as string | undefined
      )
    )
  } catch (error) {
    next(new NotFoundError('Users not found', error))
  }
}
// POST /users/signup
export const signupUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('signup', async (err, user) => {
    try {
      if (err || !user) {
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Invalid Request', err))
        } else {
          return next(new InternalServerError('Internal Server Error', err))
        }
      }
      res.json({
        message: 'Signup successfully',
        user,
      })
    } catch (error) {
      next(new InternalServerError('Internal Server Error', error))
    }
  })(req, res, next)
}

// POST /users/signin
export const signinUser = async (req: Request, res: Response) => {
  res.json({
    user: req.user,
  })
}

export const googleAuth = (req: Request, res: Response) => {
  res.json(req.user)
}

// GET /users/signout
// export const signoutUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     //   TODO: signout
//     // await UserService.signout()
//     res.json({ message: 'You have logged out' })
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       next(new BadRequestError('Invalid Request', error))
//     } else {
//       next(new InternalServerError('Internal Server Error', error))
//     }
//   }
// }

// POST /users/reset_password
// export const resetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email } = req.body

//     //   TODO: password reset query
//     await UserService.resetPassword(email)
//     res.json({ message: 'Your request has been received' })
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       next(new BadRequestError('Invalid Request', error))
//     } else {
//       next(new InternalServerError('Internal Server Error', error))
//     }
//   }
// }

// PUT /users/password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newPassword, oldPassword } = req.body
    if (newPassword === oldPassword) {
      return next(
        new BadRequestError('New password must be different from old password')
      )
    }
    // TODO: query
    await UserService.changePassword(
      (req.user as UserDocument).email,
      newPassword,
      oldPassword
    )
    const token = jwtGenerator((req.user as UserDocument).email)
    res.json({ token, message: 'Your password has been changed' })
  } catch (error) {
    next(new BadRequestError('Invalid Request'))
  }
}

// PUT /users
export const updateUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, address } = req.body
  const updatedInfo = {
    firstName,
    lastName,
    email,
    address,
  }
  const currentEmail = (req.user as UserDocument).email

  const user = await UserService.updateUser(currentEmail, updatedInfo)
  user.password = undefined
  const token = jwtGenerator(email)
  res.json({ message: 'Your profile has been updated', user: { token, user } })
}
