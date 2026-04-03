/**
 * Remove a previously stored file given its public URL path (/uploads/...).
 */

import fs from "fs";
import path from "path";

export function deleteUploadByPublicUrl(publicUrl: string | null | undefined): void {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return;
  const rel = publicUrl.replace(/^\//, "");
  const abs = path.join(process.cwd(), rel);
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      fs.unlinkSync(abs);
    }
  } catch {
    console.error(`Failed to delete upload file: ${abs}`);
  }
}
