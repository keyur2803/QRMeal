/**
 * Multer config: stores files under services/api/uploads/menu-items/
 * Public URL path: /uploads/menu-items/<filename>
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";

/** Relative to process.cwd() (services/api when running dev). */
export const MENU_ITEMS_UPLOAD_REL = path.join("uploads", "menu-items");

export function menuItemsUploadDir(): string {
  return path.join(process.cwd(), MENU_ITEMS_UPLOAD_REL);
}

export function ensureMenuUploadsDir(): void {
  fs.mkdirSync(menuItemsUploadDir(), { recursive: true });
}

/** Public path stored in DB and returned in JSON, e.g. /uploads/menu-items/abc.png */
export function publicUrlForStoredFile(filename: string): string {
  return `/uploads/menu-items/${filename}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureMenuUploadsDir();
    cb(null, menuItemsUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const safe = allowed.includes(ext) ? ext : ".jpg";
    cb(null, `${randomUUID()}${safe}`);
  }
});

export const uploadMenuImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  }
});
