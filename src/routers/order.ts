import express from 'express'
import {
  createOrder,
  findAll,
  findOrderById,
  updateOrder,
} from '../controllers/order'

import ROLES, { checkIsInRole } from '../util/role'

const router = express.Router()

router.post('/', createOrder)
router.get('/all', findAll)
router.get('/:orderId', findOrderById)
router.put('/:orderId', checkIsInRole(ROLES.Admin), updateOrder)

export default router
