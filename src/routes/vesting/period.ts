import { Router } from 'express'
import { createVestingPeriod, updateVestingPeriod, deleteVestingPeriod, updateVestingStatus } from '@controllers/vesting/vestingPeriod'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createVestingPeriod)

router
  .route('/:uuid')
  .put(updateVestingPeriod)
  .delete(deleteVestingPeriod)

router
  .route('/status/:uuid')
  .put(updateVestingStatus)

export default router