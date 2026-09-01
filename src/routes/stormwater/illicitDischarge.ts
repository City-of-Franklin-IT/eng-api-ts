import { Router } from 'express'
import { createIllicitDischarge, getIllicitDischarges, getIllicitDischarge, updateIllicitDischarge, deleteIllicitDischarge } from '@controllers/stormwater/illicitDischarge'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getIllicitDischarges)
  .post(requireWrite("stormwater"), createIllicitDischarge)

router
  .route('/:uuid')
  .get(getIllicitDischarge)
  .put(requireWrite("stormwater"), updateIllicitDischarge)
  .delete(requireWrite("stormwater"), deleteIllicitDischarge)

export default router