import { Router } from 'express'
import { createIncompleteSite, deleteIncompleteSite } from '@controllers/stormwater/incompleteSite'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("stormwater"))

router
  .route('/')
  .post(createIncompleteSite)

router
  .route('/:uuid')
  .delete(deleteIncompleteSite)

export default router