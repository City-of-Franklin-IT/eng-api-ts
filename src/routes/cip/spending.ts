import { Router } from 'express'
import { createSpending, deleteSpending } from '@controllers/cip/spending'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createSpending)

router
  .route('/:uuid')
  .delete(deleteSpending)

export default router