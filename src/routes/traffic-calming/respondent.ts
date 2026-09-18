import { Router } from 'express'
import { createRespondents, updateRespondent, deleteRespondent, getRespondents, verifyRespondent, downloadTemplate, getRespondentsByADDRKEY } from '@controllers/traffic-calming/respondent'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router
  .route('/')
  .post(entra, requireWrite("traffic-calming"), createRespondents)

router
  .route('/:uuid')
  .put(entra, requireWrite("traffic-calming"), updateRespondent)
  .delete(entra, requireWrite("traffic-calming"), deleteRespondent)

router
  .route('/petition/:uuid')
  .get(entra, getRespondents)

router
  .route('/id/:shortid')
  .get(verifyRespondent)

router
  .route('/template')
  .post(downloadTemplate)

router
  .route('/search')
  .post(entra, getRespondentsByADDRKEY)

export default router