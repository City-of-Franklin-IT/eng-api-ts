import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Attachment } from '@models/stormwater'
import processImage from '@utils/processImage'
import processPDF from '@utils/processPDF'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreateAttachmentRequest, DownloadAttachmentResponse } from './types'

// @desc    Create attachment
// @route   POST /api/v1/eng/stormwater/attachments
// @access  Private
export const createAttachment = asyncHandler(async (req: Request<{}, {}, CreateAttachmentRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { files } = req
  const { parentId } = req.body

  const email = req.user?.email

  if(!files?.length) {
    return next(new ErrorResponse('No files found', 500))
  }

  await Promise.all(
    files.map(async file => {
      if(file.mimetype.split('/')[0] === 'image') {
        await processImage(file, parentId, Attachment, email, next)
      } else await processPDF(file, parentId, Attachment, email, next)
    })
  )

  res.status(201).json({
    success: true,
    msg: "Files Uploaded"
  })
})

// @desc    Download attachment
// @route   POST /api/v1/eng/stormwater/attachments/:uuid
// @access  Private
export const getAttachment = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<DownloadAttachmentResponse>, next: NextFunction) => {
  const attachment = await Attachment.findOne({
    where: {
      uuid: req.params.uuid
    }
  })

  if(!attachment) {
    return next(new ErrorResponse("Unable to download attachment", 500))
  }

  return res.status(200).json({
    success: true,
    data: attachment
  })
})

// @desc    Delete attachment
// @route   DELETE /api/v1/eng/stormwater/attachments/:uuid
// @access  Private
exports.deleteAttachment = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  await Attachment.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Attachment Deleted"
  })
})