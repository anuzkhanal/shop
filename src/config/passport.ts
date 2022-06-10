/* eslint-disable @typescript-eslint/member-delimiter-style */
import passportLocal from 'passport-local'
import GoogleTokenStrategy from 'passport-google-id-token'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import bcrypt from 'bcrypt'

import UserService from '../services/user'
import User from '../models/User'
import { JWT_SECRET } from '../util/secrets'
import { verifyPassword, jwtGenerator } from '../util/auth'
import { UnauthorizedError } from '../helpers/apiError'

const LocalStrategy = passportLocal.Strategy
export type ParsedPayload = {
  iss: string
  azp: string
  aud: string
  sub: string
  hd: string
  email: string
  email_verified: string
  at_hash: string
  name: string
  picture: string
  given_name: string
  family_name: string
  locale: string
  iat: number
  exp: number
  jti: string
}
export type ParsedToken = {
  header: {
    alg: string
    kid: string
    typ: string
  }
  payload: ParsedPayload
  signature: string
}

type DoneFunction = (
  error: Error | null,
  user?: Express.User | false | null,
  info?: Record<string, any> | string
) => void

type Payload = {
  email: string
  iat: number
  exp: number
}
export const googleStrategy = new GoogleTokenStrategy(
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  async (parsedToken: ParsedToken, googleId: string, done: DoneFunction) => {
    const { payload } = parsedToken
    const currentUser = await UserService.findUserOrCreate(payload)
    const token = jwtGenerator(currentUser.email)
    currentUser.password = undefined
    return done(null, { user: currentUser, token })
  }
)

export const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (payload: Payload, done: DoneFunction) => {
    try {
      const userEmail = payload.email
      const currentUser = await UserService.findByEmail(userEmail)
      return done(null, currentUser)
    } catch (error) {
      return done(error)
    }
  }
)

export const signinLocal = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await UserService.findByEmail(email)
      const validate = await verifyPassword(password, user.password as string)
      if (!validate) {
        return done(
          new UnauthorizedError('Email or password is incorrect'),
          false,
          { message: 'Wrong password' }
        )
      }
      const token = jwtGenerator(user.email)

      user.password = undefined
      return done(null, { user, token }, { message: 'Logged in successfully' })
    } catch (error) {
      return done(new UnauthorizedError('Email or password is incorrect'))
    }
  }
)

export const signupLocal = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    const { firstName, lastName } = req.body
    bcrypt.hash(password as string, 10, async (error, hash) => {
      try {
        const user = new User({
          password: hash,
          firstName,
          lastName,
          email,
        })
        const createdUser = await UserService.signup(user)
        createdUser.password = undefined
        const token = jwtGenerator(createdUser.email)
        return done(null, { user: createdUser, token })
      } catch (error) {
        done(error)
      }
    })
  }
)
