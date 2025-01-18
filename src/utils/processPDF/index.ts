import { ErrorResponse } from '@utils/errorResponse'

// Types
import { NextFunction } from 'express'
import { ModelStatic, Model } from 'sequelize'
import { FileInterface } from '@models/stormwater/types'

export default async (file: FileInterface, parentId: string, model: ModelStatic<Model>, email: string | undefined, next: NextFunction): Promise<void> => { // Handle PDF upload
  const attachment = await model.create({
    parentId,
    fileType: 'pdf',
    data: file.buffer,
    createdBy: email,
    updatedBy: email
  })

  if(!attachment) {
    return next(new ErrorResponse("Unable to upload pdf", 500))
  }
}