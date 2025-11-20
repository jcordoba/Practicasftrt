-- DropForeignKey
ALTER TABLE "Practice" DROP CONSTRAINT "Practice_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Practice" DROP CONSTRAINT "Practice_tutorId_fkey";

-- AlterTable
ALTER TABLE "Practice" ALTER COLUMN "tutorId" DROP NOT NULL,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
