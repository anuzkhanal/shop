import express from 'express'

import ROLES, { checkIsInRole } from '../util/role'
import { banUser, unbanUser } from '../controllers/admin'

const router = express.Router()

router.post('/ban_user', checkIsInRole(ROLES.Admin), banUser)
router.get('/unban_user/:userId', checkIsInRole(ROLES.Admin), unbanUser)

export default router
