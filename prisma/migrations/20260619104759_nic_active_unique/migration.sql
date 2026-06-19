-- Enforce one ACTIVE application per NIC, while allowing a rejected applicant
-- to re-register (rejected/approved rows keep their NIC but are excluded here).
CREATE UNIQUE INDEX "application_nic_active_unique"
  ON "application_post_graduate" ("nic")
  WHERE "status" = 'ACTIVE';