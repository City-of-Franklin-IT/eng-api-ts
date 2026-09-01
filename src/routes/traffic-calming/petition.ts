import { Router } from 'express'
import { getPetitions, getPetition, createPetition, updatePetition, deletePetition } from '@controllers/traffic-calming/petition'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router
  .route('/')
  .get(getPetitions)
  .post(entra, requireWrite("traffic-calming"), createPetition)

router
  .route('/:uuid')
  .get(getPetition)
  .put(entra, requireWrite("traffic-calming"), updatePetition)
  .delete(entra, requireWrite("traffic-calming"), deletePetition)

export default router