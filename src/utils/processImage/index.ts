import sharp from 'sharp'
import { ErrorResponse } from '@utils/errorResponse'

// Types
import { NextFunction } from 'express'
import { ModelStatic, Model } from 'sequelize'
import { FileInterface } from '@models/stormwater/types'

export default async (file: FileInterface, parentId: string, model: ModelStatic<Model>, email: string | undefined, next: NextFunction): Promise<void> => { // Handle image upload

  sharp(file.buffer)
    .resize(960, 640, {
      fit: 'inside'
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer(async (err, buffer, info) => {

      if(err) {
        return next(new ErrorResponse("Unable to upload image", 500))
      }

      const image = await model.create({
        parentId,
        fileType: 'jpeg',
        data: buffer,
        createdBy: email,
        updatedBy: email
      })

      if(!image) {
        return next(new ErrorResponse("Unable to upload image", 500))
      }
    })
}