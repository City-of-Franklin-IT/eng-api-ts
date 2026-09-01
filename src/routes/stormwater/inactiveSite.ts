import { Router } from 'express'
import { createInactiveSite, deleteInactiveSite } from '@controllers/stormwater/inactiveSite'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("stormwater"))

router
  .route('/')
  .post(createInactiveSite)

router
  .route('/:uuid')
  .delete(deleteInactiveSite)

export default router