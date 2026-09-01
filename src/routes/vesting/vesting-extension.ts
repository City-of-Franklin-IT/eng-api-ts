import { Router } from 'express'
import { createVestingExtension, updateVestingExtension, deleteVestingExtension } from '@controllers/vesting/vestingExtension'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createVestingExtension)

router
  .route('/:uuid')
  .put(updateVestingExtension)
  .delete(deleteVestingExtension)

export default router