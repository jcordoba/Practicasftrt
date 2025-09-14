-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "academicPeriod" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT,
    "teacherId" TEXT,
    "centerId" TEXT NOT NULL,
    "programId" TEXT,
    "termId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "PlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationDetail" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "evaluationPeriod" INTEGER NOT NULL,
    "evaluationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluationType" TEXT NOT NULL DEFAULT 'regular',
    "evaluatedBy" TEXT NOT NULL,
    "evaluationDimensions" JSONB NOT NULL DEFAULT '{"academic": {"score": 0, "weight": 0.4, "observations": ""}, "pastoral": {"score": 0, "weight": 0.2, "observations": ""}, "social": {"score": 0, "weight": 0.2, "observations": ""}, "administrative": {"score": 0, "weight": 0.2, "observations": ""}}',
    "attendanceRecord" JSONB NOT NULL DEFAULT '{}',
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "attendedHours" INTEGER NOT NULL DEFAULT 0,
    "sabbathsPlanned" INTEGER NOT NULL DEFAULT 6,
    "sabbathsAttended" INTEGER NOT NULL DEFAULT 0,
    "finalGrade" DOUBLE PRECISION NOT NULL,
    "gradeCalculationMethod" TEXT NOT NULL DEFAULT 'weighted_average',
    "observations" TEXT,
    "evidenceFiles" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EvaluationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProjection" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "coordinates" JSONB,
    "organizerId" TEXT NOT NULL,
    "organizingUnit" TEXT NOT NULL,
    "collaborators" JSONB NOT NULL DEFAULT '[]',
    "targetAudience" TEXT NOT NULL,
    "maxParticipants" INTEGER,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "resources" JSONB NOT NULL DEFAULT '{}',
    "sponsors" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "objectives" TEXT[],
    "achievements" TEXT[],
    "beneficiaries" INTEGER NOT NULL DEFAULT 0,
    "impactMetrics" JSONB NOT NULL DEFAULT '{}',
    "evaluationCriteria" JSONB NOT NULL DEFAULT '{}',
    "overallRating" DOUBLE PRECISION,
    "feedback" TEXT,
    "evidenceFiles" JSONB NOT NULL DEFAULT '[]',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "reports" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "SocialProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProjectionParticipant" (
    "id" TEXT NOT NULL,
    "projectionId" TEXT NOT NULL,
    "participantId" TEXT,
    "participantType" TEXT NOT NULL,
    "externalName" TEXT,
    "externalEmail" TEXT,
    "externalPhone" TEXT,
    "externalOrganization" TEXT,
    "role" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendanceStatus" TEXT NOT NULL DEFAULT 'registered',
    "participationHours" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "participationGrade" DOUBLE PRECISION,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateCode" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "SocialProjectionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementSocialProjection" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "projectionId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementSocialProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SniesReport" (
    "id" TEXT NOT NULL,
    "reportCode" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportSubtype" TEXT,
    "reportVersion" TEXT NOT NULL DEFAULT '1.0',
    "reportPeriod" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "academicPeriod" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "programIds" TEXT[],
    "centerIds" TEXT[],
    "termIds" TEXT[],
    "title" TEXT NOT NULL,
    "description" TEXT,
    "methodology" TEXT,
    "qualityIndicators" JSONB NOT NULL DEFAULT '{}',
    "statisticalData" JSONB NOT NULL DEFAULT '{}',
    "aggregatedMetrics" JSONB NOT NULL DEFAULT '{}',
    "sourceDataSummary" JSONB NOT NULL DEFAULT '{}',
    "dataQualityMetrics" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "processingStarted" TIMESTAMP(3),
    "processingCompleted" TIMESTAMP(3),
    "validationResults" JSONB NOT NULL DEFAULT '{}',
    "validationErrors" TEXT[],
    "validationWarnings" TEXT[],
    "exportFormats" TEXT[],
    "exportedFiles" JSONB NOT NULL DEFAULT '[]',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "SniesReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SniesReportLine" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL,
    "lineCategory" TEXT NOT NULL,
    "programId" TEXT,
    "centerId" TEXT,
    "termId" TEXT,
    "studentId" TEXT,
    "placementId" TEXT,
    "lineData" JSONB NOT NULL DEFAULT '{}',
    "calculatedMetrics" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "groupKey" TEXT,
    "parentLineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SniesReportLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Term_name_key" ON "Term"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationDetail_placementId_evaluationPeriod_key" ON "EvaluationDetail"("placementId", "evaluationPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "SocialProjection_code_key" ON "SocialProjection"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementSocialProjection_placementId_projectionId_key" ON "PlacementSocialProjection"("placementId", "projectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SniesReport_reportCode_key" ON "SniesReport"("reportCode");

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjection" ADD CONSTRAINT "SocialProjection_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjection" ADD CONSTRAINT "SocialProjection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjection" ADD CONSTRAINT "SocialProjection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjectionParticipant" ADD CONSTRAINT "SocialProjectionParticipant_projectionId_fkey" FOREIGN KEY ("projectionId") REFERENCES "SocialProjection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjectionParticipant" ADD CONSTRAINT "SocialProjectionParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjectionParticipant" ADD CONSTRAINT "SocialProjectionParticipant_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProjectionParticipant" ADD CONSTRAINT "SocialProjectionParticipant_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementSocialProjection" ADD CONSTRAINT "PlacementSocialProjection_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementSocialProjection" ADD CONSTRAINT "PlacementSocialProjection_projectionId_fkey" FOREIGN KEY ("projectionId") REFERENCES "SocialProjection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementSocialProjection" ADD CONSTRAINT "PlacementSocialProjection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReport" ADD CONSTRAINT "SniesReport_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReport" ADD CONSTRAINT "SniesReport_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReport" ADD CONSTRAINT "SniesReport_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReport" ADD CONSTRAINT "SniesReport_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReportLine" ADD CONSTRAINT "SniesReportLine_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SniesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SniesReportLine" ADD CONSTRAINT "SniesReportLine_parentLineId_fkey" FOREIGN KEY ("parentLineId") REFERENCES "SniesReportLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
