import { Router } from 'express'
import { getPetitions, getPetition, createPetition, updatePetition, deletePetition } from '@controllers/traffic-calming/petition'
import { entra } from '@middleware/auth'

const router = Router()

router
  .route('/')
  .get(getPetitions)
  .post(entra, createPetition)

router
  .route('/:uuid')
  .get(getPetition)
  .put(entra, updatePetition)
  .delete(entra, deletePetition)

export default router