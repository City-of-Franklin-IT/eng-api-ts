// Types
import { ModelStatic, Model } from "sequelize"
import { Inspector } from "@models/stormwater"
import { ComplaintInterface, GreenInfrastructureInterface, IllicitDischargeInterface, InspectorInterface, SiteInterface } from "@models/stormwater/types"
import sendEmail from "./sendEmail"

export const emailInspector = async (email: string | undefined, data: { uuid: string, siteId?: string | null, name?: string, complaintId?: string, greenId?: string, illicitId?: string, details?: string }): Promise<void> => { // Email inspector
  const obj = setMsg(data)

  if(obj) {
    await sendEmail({
      email,
      subject: obj.subject,
      msg: obj.msg 
    })
  }
}

export const inspectorLookup = async (uuid: string, model: ModelStatic<Model>, inspectorId: string | null): Promise<{ email: string } | null> => { // Check if site / violation / complaint has an inspector assigned
  if(inspectorId) {
    const result = await model.findOne({
      where: {
        uuid
      },
      attributes: ['inspectorId']
    }) as unknown as { inspectorId: string | null }
    
    if(!result.inspectorId) {
      const newInspectorEmail = await Inspector.findOne({
        where: {
          inspectorId
        },
        attributes: ['email']
      }) as Model<InspectorInterface> & InspectorInterface

      return newInspectorEmail
    } else return null
  }

  return null
}

const setMsg = (data: { siteId?: string | null, name?: string, complaintId?: string, greenId?: string, illicitId?: string, details?: string, uuid: string }): { subject: string, msg: string } | null => {
  if(data.siteId) { // Site
    return {
      subject: "A site has been assigned to you",
      msg: `Site "${ data.name }" has been assigned to you.\n\nPlease visit https://dev.franklintn.gov/stormwater/sites/${ data.uuid } to view.`
    } 
  } 
  
  if(data.complaintId) { // Complaint
    return {
      subject: "A complaint has been assigned to you",
      msg: `A complaint has been assigned to you:\n\n"${ data.details }"\n\nPlease visit https://dev.franklintn.gov/stormwater to view.`
    } 
  }
  
  if(data.greenId) { // Green infrastructure violation
    return {
      subject: "A green infrastructure violation has been assigned to you",
      msg: `A green infrastructure violation has been assigned to you:\n\n"${ data.details }"\n\nPlease visit https://dev.franklintn.gov/storwmater to view.`
    }
  }
  
  if(data.illicitId) { // Illicit discharge violation
    return {
      subject: "An illicit discharge violation has been assigned to you",
      msg: `An illicit discharge violation has been assigned to you:\n\n"${ data.details }"\n\nPlease visit https://dev.franklintn.gov/stormwater to view.`
    }
  }

  return null
}