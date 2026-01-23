/*
  Warnings:

  - Added the required column `description` to the `Practice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Practice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Practice" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_evaluationdetail_created_at" ON "EvaluationDetail"("createdAt");

-- CreateIndex
CREATE INDEX "idx_evaluationdetail_evaluator" ON "EvaluationDetail"("evaluatedBy");

-- CreateIndex
CREATE INDEX "idx_evaluationdetail_final_grade" ON "EvaluationDetail"("finalGrade");

-- CreateIndex
CREATE INDEX "idx_evaluationdetail_status" ON "EvaluationDetail"("status");

-- CreateIndex
CREATE INDEX "idx_evaluationdetail_term_period" ON "EvaluationDetail"("termId", "evaluationPeriod");

-- CreateIndex
CREATE INDEX "idx_placement_center" ON "Placement"("centerId");

-- CreateIndex
CREATE INDEX "idx_placement_dates" ON "Placement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "idx_placement_program" ON "Placement"("programId");

-- CreateIndex
CREATE INDEX "idx_placement_status" ON "Placement"("status");

-- CreateIndex
CREATE INDEX "idx_placement_student" ON "Placement"("studentId");

-- CreateIndex
CREATE INDEX "idx_placement_teacher" ON "Placement"("teacherId");

-- CreateIndex
CREATE INDEX "idx_placement_term" ON "Placement"("termId");

-- CreateIndex
CREATE INDEX "idx_placement_tutor" ON "Placement"("tutorId");

-- CreateIndex
CREATE INDEX "idx_sniesreport_dates" ON "SniesReport"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "idx_sniesreport_generator" ON "SniesReport"("generatedBy");

-- CreateIndex
CREATE INDEX "idx_sniesreport_period" ON "SniesReport"("academicYear", "academicPeriod");

-- CreateIndex
CREATE INDEX "idx_sniesreport_status" ON "SniesReport"("status");

-- CreateIndex
CREATE INDEX "idx_sniesreport_type" ON "SniesReport"("reportType");

-- CreateIndex
CREATE INDEX "idx_sniesreportline_category" ON "SniesReportLine"("lineCategory");

-- CreateIndex
CREATE INDEX "idx_sniesreportline_group" ON "SniesReportLine"("groupKey");

-- CreateIndex
CREATE INDEX "idx_sniesreportline_sort" ON "SniesReportLine"("reportId", "sortOrder");

-- CreateIndex
CREATE INDEX "idx_sniesreportline_type" ON "SniesReportLine"("lineType");

-- CreateIndex
CREATE INDEX "idx_socialprojection_activity_type" ON "SocialProjection"("activityType");

-- CreateIndex
CREATE INDEX "idx_socialprojection_city" ON "SocialProjection"("city");

-- CreateIndex
CREATE INDEX "idx_socialprojection_dates" ON "SocialProjection"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "idx_socialprojection_organizer" ON "SocialProjection"("organizerId");

-- CreateIndex
CREATE INDEX "idx_socialprojection_status" ON "SocialProjection"("status");

-- CreateIndex
CREATE INDEX "idx_socialprojection_target_audience" ON "SocialProjection"("targetAudience");

-- CreateIndex
CREATE INDEX "idx_projection_participant_registration" ON "SocialProjectionParticipant"("registrationDate");

-- CreateIndex
CREATE INDEX "idx_projection_participant_status" ON "SocialProjectionParticipant"("attendanceStatus");

-- CreateIndex
CREATE INDEX "idx_projection_participant_type" ON "SocialProjectionParticipant"("participantType");

-- CreateIndex
CREATE INDEX "idx_term_academic_period" ON "Term"("academicYear", "academicPeriod");

-- CreateIndex
CREATE INDEX "idx_term_academic_year" ON "Term"("academicYear");

-- CreateIndex
CREATE INDEX "idx_term_dates" ON "Term"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "idx_term_status" ON "Term"("status");
