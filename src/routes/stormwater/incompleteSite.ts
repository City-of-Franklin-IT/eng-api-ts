import { Router } from 'express'
import { createIncompleteSite, deleteIncompleteSite } from '@controllers/stormwater/incompleteSite'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createIncompleteSite)

router
  .route('/:uuid')
  .delete(deleteIncompleteSite)

export default router