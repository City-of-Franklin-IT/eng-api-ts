import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Petition, Respondent, Response as PetitionResponse, Attachment } from '@models/traffic-calming'
import createPetitionId from '@utils/createPetitionId'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { Model } from 'sequelize'
import { PetitionInterface } from '@models/traffic-calming/types'
import { GetPetitionsResponse, GetPetitionResponse, CreatePetitionRequest, CreatePetitionResponse, UpdatePetititonRequest } from './types'

const excludeEditorFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt']

//@desc    Get petitions
//@route   GET /api/v2/eng/traffic-calming/petition
//@access  Public
export const getPetitions = asyncHandler(async (req: Request, res: Response<GetPetitionsResponse>, next: NextFunction) => {
  const petitions = await Petition.findAll({
    order: [['startDate', 'asc']],
    include: [
      { model: Respondent, attributes: { exclude: excludeEditorFields },
        include: [{ model: PetitionResponse, attributes: { exclude: excludeEditorFields } }] },
      { model: Attachment,
        attributes: ['parentId', 'fileType', 'uuid'] }
    ]
  }) as (Model<PetitionInterface> & PetitionInterface)[]

  res.status(200).json({
    success: true,
    data: petitions
  })
})

//@desc    Get petition
//@route   GET /api/v2/eng/traffic-calming/petition/:uuid
//@access  Public
export const getPetition = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetPetitionResponse>, next: NextFunction) => {
  const petition = await Petition.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [
      { model: Respondent, 
        include: [{ model: PetitionResponse }] }, 
        { model: Attachment, 
          attributes: ['parentId', 'fileType', 'uuid'] }
    ]
  }) as Model<PetitionInterface> & PetitionInterface

  if(!petition) {
    return next(new ErrorResponse(`Unable to return petition by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: petition
  })
})

//@desc    Create petition
//@route   POST /api/v2/eng/traffic-calming/petition
//@access  Private
export const createPetition = asyncHandler(async (req: Request<{}, {}, CreatePetitionRequest>, res: Response<CreatePetitionResponse>, next: NextFunction) => {
  const { description, startDate, endDate } = req.body

  const petition = await Petition.create({
    petitionId: await createPetitionId(),
    description,
    startDate,
    endDate,
    ...editorTracking(req)
  }) as Model<PetitionInterface> & PetitionInterface

  if(!petition) {
    return next(new ErrorResponse("Unable to create new petition", 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Petition Created',
    data: petition
  })
})

//@desc    Update petition
//@route   PUT /api/v2/eng/traffic-calming/petition/:uuid
//@access  Private
export const updatePetition = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdatePetititonRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { description, startDate, endDate } = req.body

  const petition = await Petition.update({
    description,
    startDate,
    endDate,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
  })

  const [affectedCount] = petition

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update petition by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Petition Updated'
  })
})

//@desc    Delete petition
//@route   DELETE /api/v2/eng/traffic-calming/petition/:uuid
//@access  Private
export const deletePetition = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Petition.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete petition by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Petition Deleted'
  })
})