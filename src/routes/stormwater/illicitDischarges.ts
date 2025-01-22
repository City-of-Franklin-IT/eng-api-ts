import express from 'express'
import { createIllicitDischarge, getIllicitDischarges, getIllicitDischarge, updateIllicitDischarge, deleteIllicitDischarge } from '@controllers/stormwater/illicitDischarges'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

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