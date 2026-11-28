-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "pixCode" TEXT,
ADD COLUMN     "simulated" BOOLEAN NOT NULL DEFAULT true;
