// Ported from finance-mcp-server-ts's tools/civicclerk/downloadAttachment.ts, adapted to this
// server's conventions (z.object() inputSchema, describeError()).
import { z } from "zod"
import { downloadFile } from "./client"
import { describeError } from "../../utils/errors"

export const downloadAttachmentTool = {
  name: "civicclerk_download_attachment",
  description: "Download an attachment file from CivicClerk by ID. Returns base64-encoded file content.",
  inputSchema: z.object({
    id: z.number().describe("The attachment ID"),
  }),
  handler: (async ({ id }: { id: number }) => {
    try {
      const buffer = await downloadFile("/public-api/Attachments/Download", { id })
      const base64 = buffer.toString("base64")
      return {
        content: [{ type: "text" as const, text: base64 }],
      }
    } catch(error) {
      return {
        content: [{ type: "text" as const, text: `Error downloading attachment: ${ describeError(error) }` }],
      }
    }
  }) as any,
}
