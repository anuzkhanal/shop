import express from 'express'
import passport from 'passport'

import {
  signupUser,
  signinUser,
  //   signoutUser,
  //   resetPassword,
  changePassword,
  updateUser,
  googleAuth,
  getUser,
  findAll,
} from '../controllers/user'
import ROLES, { checkIsInRole } from '../util/role'

const router = express.Router()
const passportJwt = passport.authenticate('jwt', { session: false })

router.get('/all', passportJwt, checkIsInRole(ROLES.Admin), findAll)
router.get('/', passportJwt, getUser)
router.post('/signup', signupUser)
router.post(
  '/signin',
  passport.authenticate('login', { session: false }),
  signinUser
)
router.post(
  '/signin_with_google',
  passport.authenticate('google-id-token', { session: false }),
  googleAuth
)
// router.get('/signout', passportJwt, signoutUser)
// router.post('/reset_password', resetPassword)
router.put('/password', passportJwt, changePassword)
router.put('/', passportJwt, updateUser)

export default router
