-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#22D3EE',
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
