import express from 'express'
import passport from 'passport'

import {
  createProduct,
  findById,
  deleteProduct,
  findAll,
  updateProduct,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategories,
} from '../controllers/product'
import ROLES, { checkIsInRole } from '../util/role'

const router = express.Router()
const passportJwt = passport.authenticate('jwt', { session: false })

router.get('/categories', getCategories)
router.post(
  '/categories',
  passportJwt,
  checkIsInRole(ROLES.Admin),
  createCategory
)
router.put(
  '/categories/:categoryId',
  passportJwt,
  checkIsInRole(ROLES.Admin),
  updateCategory
)
router.delete(
  '/categories/:categoryId',
  passportJwt,
  checkIsInRole(ROLES.Admin),
  deleteCategory
)
router.get('/', findAll)
router.get('/:productId', findById)
router.post('/', passportJwt, checkIsInRole(ROLES.Admin), createProduct)
router.put(
  '/:productId',
  passportJwt,
  checkIsInRole(ROLES.Admin),
  updateProduct
)
router.delete(
  '/:productId',
  passportJwt,
  checkIsInRole(ROLES.Admin),
  deleteProduct
)

export default router
