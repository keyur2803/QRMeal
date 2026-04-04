/**
 * Multer config: stores files under services/api/uploads/menu-items/
 * Public URL path: /uploads/menu-items/<filename>
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { deleteUploadByPublicUrl } from "./deleteUpload.js";

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

function cloudinaryEnabled(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

let cloudinaryConfigured = false;
function ensureCloudinaryConfigured(): void {
  if (!cloudinaryEnabled() || cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  cloudinaryConfigured = true;
}

const localDiskStorage = multer.diskStorage({
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
  storage: cloudinaryEnabled() ? multer.memoryStorage() : localDiskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  }
});

export async function storeMenuItemImage(file: Express.Multer.File): Promise<string> {
  if (cloudinaryEnabled()) {
    ensureCloudinaryConfigured();
    const folder = process.env.CLOUDINARY_FOLDER || "qrmeal/menu-items";
    const publicId = randomUUID();
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: "image" },
        (err, res) => {
          if (err || !res) {
            reject(err ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve(res);
        }
      );
      stream.end(file.buffer);
    });

    const url = new URL(result.secure_url);
    url.searchParams.set("cid", result.public_id);
    return url.toString();
  }

  const f = file as Express.Multer.File & { filename?: string };
  if (!f.filename) {
    throw new Error("Upload failed");
  }
  return publicUrlForStoredFile(f.filename);
}

export async function deleteMenuItemImage(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl) return;
  if (imageUrl.startsWith("/uploads/")) {
    deleteUploadByPublicUrl(imageUrl);
    return;
  }
  if (!cloudinaryEnabled()) return;
  let cid: string | null = null;
  try {
    const u = new URL(imageUrl);
    cid = u.searchParams.get("cid");
  } catch {
    cid = null;
  }
  if (!cid) return;
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(cid, { invalidate: true, resource_type: "image" }).catch(() => undefined);
}
