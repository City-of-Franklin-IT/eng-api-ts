import fs from 'fs'
import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import createShortId from '@utils/createShortId'
import editorTracking from '@utils/editorTracking'
import { InforAddress } from '@models/infor'
import { Petition, Respondent, Response as PetitionResponse, Attachment } from '@models/traffic-calming'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { Model } from 'sequelize'
import { RespondentInterface } from '@models/traffic-calming/types'
import { InforAddressInterface } from '@models/infor/types'
import { CreateRespondentsRequest, UpdateRespondentRequest, VerifyRespondentResponse, GetRespondentsByADDRKEYRequest, GetRespondentsByADDRKEYResponse } from './types'

//@desc    Create petition respondents
//@route   POST /api/v1/eng/traffic-calming/respondent
//@access  Private
export const createRespondents = asyncHandler(async (req: Request<{}, {}, CreateRespondentsRequest[]>, res: Response<ControllerResponse>, next: NextFunction) => {
  const newRespondents = req.body

  Promise.all(
    newRespondents.map(async respondent => {
    const { name, address, ownerAddress, ownerCity, ownerState, ownerZIP, parentId } = respondent

    await Respondent.create({
      name,
      address,
      ownerAddress,
      ownerCity,
      ownerState,
      ownerZIP,
      shortId: createShortId(),
      parentId,
      ...editorTracking(req)
    })
  }))

  res.status(201).json({
    success: true,
    msg: 'Petition Respondents Created'
  })
})

//@desc    Update petition respondent
//@route   PUT /api/v1/eng/traffic-calming/respondent/:uuid
//@access  Private
export const updateRespondent = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateRespondentRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { name, address, ownerAddress, ownerCity, ownerState, ownerZIP } = req.body

  const respondent = await Respondent.update({
    name,
    address,
    ownerAddress,
    ownerCity,
    ownerState,
    ownerZIP,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = respondent

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update petition respondent by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Petition Respondent Updated'
  })
})

//@desc    Delete petition respondent
//@route   DELETE /api/v1/eng/traffic-calming/respondent/:uuid
//@access  Private
export const deleteRespondent = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Respondent.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete respondent by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Petition Respondent Deleted'
  })
})

//@desc    Get respondents by petition
//@route   GET /api/v1/eng/traffic-calming/respondent/petition/:uuid
//@access  Public
export const getRespondents = asyncHandler(async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
  const respondents = await Respondent.findAll({
    where: {
      parentId: req.params.uuid
    },
    include: { model: PetitionResponse }
  }) as (Model<RespondentInterface> & RespondentInterface)[]

  res.status(200).json({
    success: true,
    data: respondents
  })
})

//@desc    Verify respondent by shortId
//@route   GET /api/v1/eng/traffic-calming/respondent/id/:shortid
//@access  Public
export const verifyRespondent = asyncHandler(async (req: Request<{ shortid: string }>, res: Response<VerifyRespondentResponse>, next: NextFunction) => {
  const result = await Respondent.findOne({
    where: {
      shortId: req.params.shortid
    },
    include: [
      { model: Petition, 
        include: [
          { model: Attachment,
            attributes: ['parentId', 'fileType', 'uuid']
          }
        ]}, 
      { model: PetitionResponse }
    ]
  }) as Model<RespondentInterface> & RespondentInterface

  if(!result) { // No match on shortId
    res.status(400).json({
      success: false,
      msg: `Unable to verify respondent id ${ req.params.shortid }`
    })
  }

  if(result.Response) { // Match on shortId - has response
    const response = result.Response.response ? 'Yes' : 'No'
    const responseDate = new Date(result.Response.createdAt).toLocaleDateString()

    res.status(400).json({
      success: false,
      msg: `Received ${ response } vote on ${ responseDate }`
    })
  }

  res.status(200).json({ // Verified shortId 
    success: true,
    data: result,
    msg: "Respondent Verified"
  })
})

//@desc    Download respondent template
//@route   POST /api/v1/eng/traffic-calming/respondent/template
//@access  Private
export const downloadTemplate = asyncHandler(async (req: Request, res: Response<Promise<void>>, next: NextFunction) => {
  const fileName = 'TrafficCalmingTemplate.csv'
  const filePath = `../eng-api-ts/public/files/${ fileName }`

  const fileExists = await fs.promises.access(filePath).then(() => true).catch(() => false)

  if(!fileExists) {
    return next(new ErrorResponse('Unable to download template', 500))
  }

  res.download(filePath) // File download
})

//@desc    Get respondents by ADDRKEY
//@route   POST /api/v1/eng/traffic-calming/respondent/search
//@access  Private
export const getRespondentsByADDRKEY = asyncHandler(async (req: Request<{}, {}, GetRespondentsByADDRKEYRequest>, res: Response<GetRespondentsByADDRKEYResponse>, next: NextFunction) => {
  const { addrkeys } = req.body

  const results = await InforAddress.findAll({ // Query Infor db
    where: {
      addrkey: {
        [Op.in]: addrkeys
      }
    }
  }) as (Model<InforAddressInterface> & InforAddressInterface)[]

  res.status(200).json({
    success: true,
    data: results
  })
})