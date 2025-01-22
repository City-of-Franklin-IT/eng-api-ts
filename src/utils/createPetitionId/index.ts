import { Op } from "sequelize"
import { Petition } from "@models/traffic-calming"

export default async () => { // Create petitionId
  const date = new Date()
  const year = date.getFullYear()
  const prefix = `${ year }-`
  let count = await Petition.count({
    where: {
      petitionId: {
        [Op.like]: `${ prefix }%`
      }
    }
  })

  let petitionId = `${ prefix }${ count + 1 }`
  let petitionExists = await Petition.findOne({ where: { petitionId } })

  while(petitionExists) {
    count++
    petitionId = `${ prefix }${ count + 1 }`
    petitionExists = await Petition.findOne({ where: { petitionId } })
  }

  return petitionId
}