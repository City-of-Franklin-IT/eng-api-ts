import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import processImage from '@utils/processImage'
import processPDF from '@utils/processPDF'
import { Attachment } from '@models/traffic-calming'
import determineFileType from '@utils/determineFileType'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { Model } from 'sequelize'
import { AttachmentInterface } from '@models/traffic-calming/types'
import { CreateAttachmentRequest, DownloadAttachmentResponse } from './types'
import { FileInterface } from '@models/stormwater/types'

//@desc    Upload attachment
//@route   POST /api/v2/eng/traffic-calming/attachment
//@access  Private
export const createAttachment = asyncHandler(async (req: Request<{}, {}, CreateAttachmentRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { file } = req
  const { parentId } = req.body

  const email = req.entra?.preferred_username

  const fileType = determineFileType(file?.buffer)

  if(fileType.type === 'image') { 
    await processImage(file as unknown as FileInterface, parentId, Attachment, email, next) // Image
  } else await processPDF(file as unknown as FileInterface, parentId, Attachment, email, next) // PDF

  res.status(201).json({
    success: true,
    msg: "File Uploaded"
  })
})

// @desc    Download attachment
// @route   GET /api/v2/eng/traffic-calming/attachment/:uuid
// @access  Private
export const getAttachment = asyncHandler(async (req:Request<{ uuid: string }>, res: Response<DownloadAttachmentResponse>, next: NextFunction) => {
  const attachment = await Attachment.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<AttachmentInterface> & AttachmentInterface

  if(!attachment) {
    return next(new ErrorResponse(`Unable to download attachment by uuid ${ req.params.uuid }`, 404))
  }

  return res.status(200).json({
    success: true,
    data: attachment
  })
})

// @desc    Delete attachment
// @route   DELETE /api/v2/eng/traffic-calming/attachments/:uuid
// @access  Private
export const deleteAttachment = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Attachment.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Could not delete attachment by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Attachment Deleted"
  })
})