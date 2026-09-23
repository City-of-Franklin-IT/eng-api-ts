// Ported verbatim from finance-mcp-server-ts's tools/civicclerk/trimUtils.ts.
const MAX_DESCRIPTION_LENGTH = 150

export const trimDescription = (desc: string | undefined | null, maxLen = MAX_DESCRIPTION_LENGTH): string | undefined => {
  if(!desc) return undefined
  if(desc.length <= maxLen) return desc
  return desc.slice(0, maxLen) + "..."
}
