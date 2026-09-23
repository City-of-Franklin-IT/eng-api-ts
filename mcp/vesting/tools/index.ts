export {
  listProjectsTool,
  getProjectTool,
  listMilestonesDueTool,
  listVestingPeriodsTool,
  listNotificationsTool,
  searchProjectMeetingsTool,
} from "./vesting"

export {
  getMeetingsTool,
  getLatestMeetingTool,
  getMeetingItemsTool,
  downloadAttachmentTool,
  searchAgendaItemsTool,
} from "./civicclerk"

// Default export with all tools as array
import {
  listProjectsTool,
  getProjectTool,
  listMilestonesDueTool,
  listVestingPeriodsTool,
  listNotificationsTool,
  searchProjectMeetingsTool,
} from "./vesting"
import {
  getMeetingsTool,
  getLatestMeetingTool,
  getMeetingItemsTool,
  downloadAttachmentTool,
  searchAgendaItemsTool,
} from "./civicclerk"

export default [
  listProjectsTool,
  getProjectTool,
  listMilestonesDueTool,
  listVestingPeriodsTool,
  listNotificationsTool,
  searchProjectMeetingsTool,
  getMeetingsTool,
  getLatestMeetingTool,
  getMeetingItemsTool,
  downloadAttachmentTool,
  searchAgendaItemsTool,
]
