import { Router } from 'express'
import { createSpending, deleteSpending, updateSpending } from '@controllers/cip/spending'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createSpending)

router
  .route('/:uuid')
  .put(updateSpending)
  .delete(deleteSpending)

export default router