// Ported verbatim from finance-mcp-server-ts's tools/civicclerk/filterFields.ts.
// Extract only relevant fields from CivicClerk API responses to reduce data bloat.
import { isBoilerplateItem } from "./agendaUtils"
import { trimDescription } from "./trimUtils"

const filterMeetingItem = (item: any, includeAttachments: boolean = false): any | null => {
  if(!item || isBoilerplateItem(item)) return null

  const filteredChildItems = item.childItems?.map((child: any) => filterMeetingItem(child, includeAttachments)).filter(Boolean) || null

  const result: any = {
    id: item.id,
    idNumber: item.idNumber,
    itemName: item.itemName,
    agendaObjectItemOutlineNumber: item.agendaObjectItemOutlineNumber,
    agendaObjItemCategoryTypeDesc: item.agendaObjItemCategoryTypeDesc,
    agendaObjectItemDescription: trimDescription(item.agendaObjectItemDescription),
    isSection: item.isSection,
    childItems: filteredChildItems,
  }

  if(includeAttachments) {
    const attachments = (item.attachmentsList || []).map((att: any) => ({
      id: att.id,
      name: att.name,
      url: att.publicUrl,
    }))
    result.attachments = attachments && attachments.length > 0 ? attachments : undefined
    result.publishedFiles = item.publishedFiles
    result.reportsList = item.reportsList
  }

  return result
}

export const filterMeetingResponse = (meeting: any, includeAttachments: boolean = false): any => {
  if(!meeting) return meeting

  const result: any = {
    id: meeting.id,
    name: meeting.name,
    meetingDate: meeting.meetingDate,
    items: meeting.items?.map((item: any) => filterMeetingItem(item, includeAttachments)).filter(Boolean) || [],
  }

  if(includeAttachments) {
    result.files = meeting.files || []
  }

  return result
}

export const filterMeetingResponseSlim = (meeting: any): any => {
  if(!meeting) return meeting
  return {
    id: meeting.id,
    name: meeting.name,
    meetingDate: meeting.meetingDate,
  }
}
