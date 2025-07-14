import { Router } from 'express'
import { createVestingExtension, updateVestingExtension, deleteVestingExtension } from '@controllers/vesting/vestingExtension'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createVestingExtension)

router
  .route('/:uuid')
  .put(updateVestingExtension)
  .delete(deleteVestingExtension)

export default router