-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "calories" TEXT,
ADD COLUMN     "customizations" TEXT[],
ADD COLUMN     "dietaryTags" TEXT[],
ADD COLUMN     "prepTime" TEXT NOT NULL DEFAULT '';
