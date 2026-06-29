-- CreateEnum
CREATE TYPE "TestimonialRelationship" AS ENUM ('MANAGER', 'PEER', 'REPORT', 'CLIENT', 'PARTNER', 'TEACHER', 'STUDENT', 'OTHER');

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "authorCompany" TEXT,
ADD COLUMN     "authorRelationship" "TestimonialRelationship";

