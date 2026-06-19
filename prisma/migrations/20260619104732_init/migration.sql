-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'SUPERVISOR', 'MAIN_ADMIN', 'FACULTY_ADMIN', 'REGISTRAR');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RESIDENTIAL', 'MOBILE', 'OFFICE', 'MOBILE_OFFICE');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('PENDING', 'FACULTY_REVIEW', 'FORWARDED_TO_ADMIN', 'UNDER_REVIEW', 'CORRECTION_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('MPHIL', 'PHD', 'OTHER');

-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('FULL_TIME', 'PART_TIME');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('ACTIVE', 'REJECTED', 'APPROVED');

-- CreateTable
CREATE TABLE "degree_duration" (
    "duration_id" SERIAL NOT NULL,
    "level" "DegreeLevel" NOT NULL,
    "mode" "StudyMode" NOT NULL,
    "years" INTEGER NOT NULL,

    CONSTRAINT "degree_duration_pkey" PRIMARY KEY ("duration_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "supabase_user_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "registrar" (
    "registrar_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "registrar_pkey" PRIMARY KEY ("registrar_id")
);

-- CreateTable
CREATE TABLE "faculty_admin" (
    "faculty_admin_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "faculty" TEXT NOT NULL,
    "faculty_id" INTEGER,

    CONSTRAINT "faculty_admin_pkey" PRIMARY KEY ("faculty_admin_id")
);

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "supervisor" (
    "supervisor_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "address" TEXT,
    "university" TEXT,
    "telephone" TEXT,
    "cv_file" TEXT,

    CONSTRAINT "supervisor_pkey" PRIMARY KEY ("supervisor_id")
);

-- CreateTable
CREATE TABLE "payment_structure" (
    "payment_id" SERIAL NOT NULL,
    "description" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,

    CONSTRAINT "payment_structure_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "faculty_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("faculty_id")
);

-- CreateTable
CREATE TABLE "department" (
    "department_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "faculty_id" INTEGER NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "degree_sought" (
    "degree_sought_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "level" "DegreeLevel" NOT NULL DEFAULT 'OTHER',
    "add_date" DATE,
    "faculty" TEXT,
    "department" TEXT,
    "department_id" INTEGER,
    "payment_id" INTEGER,

    CONSTRAINT "degree_sought_pkey" PRIMARY KEY ("degree_sought_id")
);

-- CreateTable
CREATE TABLE "application_post_graduate" (
    "application_id" SERIAL NOT NULL,
    "student_user_id" INTEGER,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "full_name" TEXT NOT NULL,
    "name_with_initials" TEXT NOT NULL,
    "nic" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "marital_status" "MaritalStatus",
    "english_proficiency" TEXT,
    "residential_address" TEXT,
    "official_address" TEXT,
    "faculty" TEXT,
    "department" TEXT,
    "degree_program" TEXT,
    "faculty_id" INTEGER,
    "study_mode" "StudyMode",
    "duration_years" INTEGER,
    "program_start_year" INTEGER,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_post_graduate_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "applicant_email" (
    "email_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "applicant_email_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "applicant_contact" (
    "contact_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "contact_type" "ContactType" NOT NULL,
    "contact_value" TEXT NOT NULL,

    CONSTRAINT "applicant_contact_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "work_experience" (
    "work_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "organization" TEXT NOT NULL,
    "period_from" DATE NOT NULL,
    "period_to" DATE,
    "nature_of_work" TEXT,
    "position_held" TEXT,
    "current_responsibilities" TEXT,

    CONSTRAINT "work_experience_pkey" PRIMARY KEY ("work_id")
);

-- CreateTable
CREATE TABLE "work_experience_file" (
    "file_id" SERIAL NOT NULL,
    "work_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_experience_file_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "academic_qualification" (
    "academic_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "university" TEXT NOT NULL,
    "degree_name" TEXT,
    "period_from" DATE,
    "period_to" DATE,
    "specialization" TEXT,
    "degree_class" TEXT,
    "gpa" TEXT,
    "credit_count" TEXT,
    "effective_date" DATE,

    CONSTRAINT "academic_qualification_pkey" PRIMARY KEY ("academic_id")
);

-- CreateTable
CREATE TABLE "academic_qualification_file" (
    "file_id" SERIAL NOT NULL,
    "academic_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_qualification_file_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "professional_qualification" (
    "professional_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "institution" TEXT NOT NULL,
    "period_from" DATE,
    "period_to" DATE,
    "field_of_study" TEXT,

    CONSTRAINT "professional_qualification_pkey" PRIMARY KEY ("professional_id")
);

-- CreateTable
CREATE TABLE "professional_qualification_file" (
    "file_id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_qualification_file_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "uploaded_file" (
    "uploaded_file_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "category" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_file_pkey" PRIMARY KEY ("uploaded_file_id")
);

-- CreateTable
CREATE TABLE "applicant_declaration" (
    "declaration_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "declaration_date" DATE NOT NULL,
    "status" "DeclarationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_comment" TEXT,
    "admin_id" INTEGER,
    "faculty_comment" TEXT,
    "faculty_admin_id" INTEGER,
    "registrar_comment" TEXT,
    "registrar_id" INTEGER,

    CONSTRAINT "applicant_declaration_pkey" PRIMARY KEY ("declaration_id")
);

-- CreateTable
CREATE TABLE "research_proposal" (
    "proposal_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "degree_sought_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "enrolment_status" TEXT,
    "registrar_comment" TEXT,
    "research_location" TEXT,
    "submitted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_proposal_pkey" PRIMARY KEY ("proposal_id")
);

-- CreateTable
CREATE TABLE "progress_report_schedule" (
    "schedule_id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_report_schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "proposal_file" (
    "file_id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_file_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "proposal_supervisor" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "proposal_supervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_report" (
    "progress_id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "schedule_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_report_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "progress_report_file" (
    "file_id" SERIAL NOT NULL,
    "progress_id" INTEGER NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_report_file_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "supervisor_progress_review" (
    "review_id" SERIAL NOT NULL,
    "progress_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "signed_document" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "supervisor_progress_review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "presentation" (
    "presentation_id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "progress_id" INTEGER,
    "title" TEXT NOT NULL,
    "presentation_date" TIMESTAMP(3) NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "created_by_admin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presentation_pkey" PRIMARY KEY ("presentation_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "application_id" INTEGER,
    "supervisor_id" INTEGER,
    "admin_id" INTEGER,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "degree_duration_level_mode_key" ON "degree_duration"("level", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "user_supabase_user_id_key" ON "user"("supabase_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registrar_user_id_key" ON "registrar"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_admin_user_id_key" ON "faculty_admin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_id_key" ON "admin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_user_id_key" ON "supervisor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_name_key" ON "faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "department_faculty_id_name_key" ON "department"("faculty_id", "name");

-- CreateIndex
CREATE INDEX "application_post_graduate_nic_idx" ON "application_post_graduate"("nic");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_supervisor_proposal_id_supervisor_id_key" ON "proposal_supervisor"("proposal_id", "supervisor_id");

-- AddForeignKey
ALTER TABLE "registrar" ADD CONSTRAINT "registrar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_admin" ADD CONSTRAINT "faculty_admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_admin" ADD CONSTRAINT "faculty_admin_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("faculty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor" ADD CONSTRAINT "supervisor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degree_sought" ADD CONSTRAINT "degree_sought_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degree_sought" ADD CONSTRAINT "degree_sought_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment_structure"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_post_graduate" ADD CONSTRAINT "application_post_graduate_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_post_graduate" ADD CONSTRAINT "application_post_graduate_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("faculty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_email" ADD CONSTRAINT "applicant_email_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_contact" ADD CONSTRAINT "applicant_contact_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experience_file" ADD CONSTRAINT "work_experience_file_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "work_experience"("work_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_qualification" ADD CONSTRAINT "academic_qualification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_qualification_file" ADD CONSTRAINT "academic_qualification_file_academic_id_fkey" FOREIGN KEY ("academic_id") REFERENCES "academic_qualification"("academic_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_qualification" ADD CONSTRAINT "professional_qualification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_qualification_file" ADD CONSTRAINT "professional_qualification_file_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professional_qualification"("professional_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_declaration" ADD CONSTRAINT "applicant_declaration_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_declaration" ADD CONSTRAINT "applicant_declaration_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_declaration" ADD CONSTRAINT "applicant_declaration_faculty_admin_id_fkey" FOREIGN KEY ("faculty_admin_id") REFERENCES "faculty_admin"("faculty_admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_declaration" ADD CONSTRAINT "applicant_declaration_registrar_id_fkey" FOREIGN KEY ("registrar_id") REFERENCES "registrar"("registrar_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_proposal" ADD CONSTRAINT "research_proposal_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_proposal" ADD CONSTRAINT "research_proposal_degree_sought_id_fkey" FOREIGN KEY ("degree_sought_id") REFERENCES "degree_sought"("degree_sought_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report_schedule" ADD CONSTRAINT "progress_report_schedule_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "research_proposal"("proposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report_schedule" ADD CONSTRAINT "progress_report_schedule_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisor"("supervisor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_file" ADD CONSTRAINT "proposal_file_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "research_proposal"("proposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_supervisor" ADD CONSTRAINT "proposal_supervisor_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "research_proposal"("proposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_supervisor" ADD CONSTRAINT "proposal_supervisor_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisor"("supervisor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report" ADD CONSTRAINT "progress_report_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "research_proposal"("proposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report" ADD CONSTRAINT "progress_report_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "progress_report_schedule"("schedule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report_file" ADD CONSTRAINT "progress_report_file_progress_id_fkey" FOREIGN KEY ("progress_id") REFERENCES "progress_report"("progress_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_progress_review" ADD CONSTRAINT "supervisor_progress_review_progress_id_fkey" FOREIGN KEY ("progress_id") REFERENCES "progress_report"("progress_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_progress_review" ADD CONSTRAINT "supervisor_progress_review_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisor"("supervisor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "research_proposal"("proposal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_progress_id_fkey" FOREIGN KEY ("progress_id") REFERENCES "progress_report"("progress_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_created_by_admin_fkey" FOREIGN KEY ("created_by_admin") REFERENCES "admin"("admin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application_post_graduate"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisor"("supervisor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("admin_id") ON DELETE CASCADE ON UPDATE CASCADE;
