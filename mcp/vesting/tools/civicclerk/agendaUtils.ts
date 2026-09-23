// Ported from finance-mcp-server-ts's tools/civicclerk/agendaUtils.ts. matchesQuery/searchItems
// were originally private to searchAgendaItems.ts there; pulled out here (still exported) so
// vesting/searchProjectMeetings.ts can reuse the identical text-matching logic instead of
// duplicating it.
import { trimDescription } from "./trimUtils"

export const isBoilerplateItem = (item: any): boolean => {
  return (
    item.isSection === true &&
    !item.idNumber &&
    (!item.childItems || item.childItems.length === 0) &&
    (!item.attachmentsList || item.attachmentsList.length === 0) &&
    (!item.reportsList || item.reportsList.length === 0) &&
    (!item.publishedFiles || item.publishedFiles.length === 0)
  )
}

// Skips isBoilerplateItem rows entirely (empty section headers carry no information, and by
// definition have no children to recurse into) -- one more place to stay slim given the vendor
// API returns everything, boilerplate included, on every fetch.
export const flattenItems = (items: any[], parentName = ""): any[] =>
  items.flatMap((item) => {
    if(isBoilerplateItem(item)) return []
    return [
      {
        id: item.id,
        idNumber: item.idNumber,
        name: item.itemName,
        outlineNumber: item.agendaObjectItemOutlineNumber,
        description: item.agendaObjectItemDescription,
        isSection: item.isSection,
        parent: parentName || null,
        attachments: (item.attachmentsList || []).map((att: any) => ({
          id: att.id,
          name: att.name,
          url: att.publicUrl,
        })),
      },
      ...flattenItems(item.childItems ?? [], item.itemName),
    ]
  })

export const matchesQuery = (item: any, terms: string[]): boolean => {
  const haystack = `${ item.itemName || "" } ${ item.agendaObjectItemDescription || "" }`.toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

// Intentionally omits attachment URLs (Azure SAS-signed links run 400-500+ chars each) --
// civicclerk_download_attachment only needs the id, so the url is dead weight in search results.
export const searchItems = (items: any[], terms: string[], matches: any[]) => {
  for(const item of items || []) {
    if(!isBoilerplateItem(item) && matchesQuery(item, terms)) {
      const attachments = (item.attachmentsList || []).map((att: any) => ({
        id: att.id,
        name: att.name,
      }))
      matches.push({
        id: item.id,
        idNumber: item.idNumber,
        name: item.itemName,
        outlineNumber: item.agendaObjectItemOutlineNumber,
        description: trimDescription(item.agendaObjectItemDescription),
        ...(attachments.length > 0 && { attachments }),
      })
    }
    if(item.childItems?.length) {
      searchItems(item.childItems, terms, matches)
    }
  }
}
