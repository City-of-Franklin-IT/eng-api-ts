import { Router } from 'express'
import { createIllicitDischarge, getIllicitDischarges, getIllicitDischarge, updateIllicitDischarge, deleteIllicitDischarge } from '@controllers/stormwater/illicitDischarge'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getIllicitDischarges)
  .post(createIllicitDischarge)

router
  .route('/:uuid')
  .get(getIllicitDischarge)
  .put(updateIllicitDischarge)
  .delete(deleteIllicitDischarge)

export default router