DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      p.id,
      p."studentId" AS student_id,
      p."tutorId" AS tutor_id,
      p."teacherId" AS teacher_id,
      EXISTS(SELECT 1 FROM "User" u WHERE u.id = p."studentId") AS student_exists,
      EXISTS(SELECT 1 FROM "User" u WHERE u.id = p."tutorId") AS tutor_exists,
      EXISTS(SELECT 1 FROM "User" u WHERE u.id = p."teacherId") AS teacher_exists
    FROM "Practice" p
    ORDER BY p."createdAt" DESC
    LIMIT 20
  LOOP
    RAISE NOTICE 'ID=% | student=% (%) | tutor=% (%) | teacher=% (%)',
      r.id,
      r.student_id,
      r.student_exists,
      r.tutor_id,
      r.tutor_exists,
      r.teacher_id,
      r.teacher_exists;
  END LOOP;
END $$;