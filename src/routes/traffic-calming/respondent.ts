import { Router } from 'express'
import { createRespondents, updateRespondent, deleteRespondent, getRespondents, verifyRespondent, downloadTemplate, getRespondentsByADDRKEY } from '@controllers/traffic-calming/respondent'
import { entra } from '@middleware/auth'

const router = Router()

router
  .route('/')
  .post(entra, createRespondents)

router
  .route('/:uuid')
  .put(updateRespondent)
  .delete(entra, deleteRespondent)

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