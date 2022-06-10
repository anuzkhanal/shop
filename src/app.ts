import compression from 'compression'
import express from 'express'
import lusca from 'lusca'
import dotenv from 'dotenv'
import passport from 'passport'
import cors from 'cors'

import movieRouter from './routers/movie'
import productRouter from './routers/product'
import userRouter from './routers/user'
import adminRouter from './routers/admin'
import orderRouter from './routers/order'
import apiErrorHandler from './middlewares/apiErrorHandler'
import apiContentType from './middlewares/apiContentType'
import {
  googleStrategy,
  jwtStrategy,
  signupLocal,
  signinLocal,
} from './config/passport'

dotenv.config({ path: '.env' })
const app = express()

// Express configuration
app.set('port', process.env.PORT || 3000)
app.use(cors())
app.use(apiContentType)
// Use common 3rd-party middlewares
app.use(compression())
// app.use(express.json())
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ limit: '25mb', extended: true }))

app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use(passport.initialize())

// passport strategies
passport.use(googleStrategy)
passport.use(jwtStrategy)
passport.use('login', signinLocal)
passport.use('signup', signupLocal)

// Use movie router
app.use('/api/v1/movies', movieRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', userRouter)
app.use(
  '/api/v1/admin',
  passport.authenticate('jwt', { session: false }),
  adminRouter
)
app.use(
  '/api/v1/orders',
  passport.authenticate('jwt', { session: false }),
  orderRouter
)
// Custom API error handler
app.use(apiErrorHandler)

export default app
