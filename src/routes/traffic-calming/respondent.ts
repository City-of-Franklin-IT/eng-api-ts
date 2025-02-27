import { Router } from 'express'
import { createRespondents, updateRespondent, deleteRespondent, getRespondents, verifyRespondent, downloadTemplate, getRespondentsByADDRKEY } from '@controllers/traffic-calming/respondent'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(protect, createRespondents)

router
  .route('/:uuid')
  .put(updateRespondent)
  .delete(protect, deleteRespondent)

router
  .route('/petition/:uuid')
  .get(protect, getRespondents)

router
  .route('/id/:shortid')
  .get(verifyRespondent)

router
  .route('/template')
  .post(downloadTemplate)

router
  .route('/search')
  .post(protect, getRespondentsByADDRKEY)

export default router