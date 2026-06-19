"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { durationLabel } from "@/lib/duration";
import { FileField, type UploadedRef } from "./file-field";

// ---- Types mirroring the /api/register contract --------------------------

type StudyModeVal = "FULL_TIME" | "PART_TIME";
type DegreeNode = {
  id: number;
  name: string;
  level: "MPHIL" | "PHD" | "OTHER";
  type: string | null;
  studyModes: StudyModeVal[];
};

const ENGLISH_LEVELS = ["Excellent", "Good", "Average", "Weak"];
type DeptNode = { id: number; name: string; degrees: DegreeNode[] };
export type FacultyNode = { id: number; name: string; departments: DeptNode[] };

type Contact = { type: "MOBILE" | "RESIDENTIAL" | "OFFICE" | "MOBILE_OFFICE"; value: string };
type Academic = {
  university: string; degreeName: string; degreeClass: string; gpa: string;
  creditCount: string; periodFrom: string; periodTo: string; file: UploadedRef | null;
};
type Work = { organization: string; positionHeld: string; periodFrom: string; periodTo: string; file: UploadedRef | null };
type Professional = { institution: string; fieldOfStudy: string; periodFrom: string; periodTo: string; file: UploadedRef | null };
export type SupervisorOption = {
  id: number;
  name: string;
  title: string | null;
  university: string | null;
};

type Supervisor = {
  supervisorId: number | null;
  isMain: boolean;
  cv: UploadedRef | null;
  consent: UploadedRef | null;
};

type Form = {
  facultyId: number | null; departmentId: number | null; degreeId: number | null;
  fullName: string; nameWithInitials: string; nic: string; dateOfBirth: string;
  maritalStatus: "" | "SINGLE" | "MARRIED"; email: string;
  studyMode: "" | "FULL_TIME" | "PART_TIME";
  englishProficiency: string; residentialAddress: string; officialAddress: string;
  contacts: Contact[];
  academics: Academic[];
  works: Work[];
  professionals: Professional[];
  documents: {
    cv: UploadedRef | null; birthCertificate: UploadedRef | null; transcript: UploadedRef | null;
    referees: UploadedRef[]; budgets: UploadedRef[];
  };
  ack: { applicationForm: boolean; signedProposal: boolean; photographs: boolean; paymentReceipts: boolean };
  proposal: { title: string; objectives: string; file: UploadedRef | null };
  supervisors: Supervisor[];
};

const STEPS = [
  "Programme & Personal",
  "Academic Qualifications",
  "Work Experience",
  "Professional Experience",
  "Documents",
  "Proposal & Supervisors",
  "Review & Submit",
];

const emptyAcademic = (): Academic => ({
  university: "", degreeName: "", degreeClass: "", gpa: "", creditCount: "",
  periodFrom: "", periodTo: "", file: null,
});
const emptyWork = (): Work => ({ organization: "", positionHeld: "", periodFrom: "", periodTo: "", file: null });
const emptyProf = (): Professional => ({ institution: "", fieldOfStudy: "", periodFrom: "", periodTo: "", file: null });

const initialForm: Form = {
  facultyId: null, departmentId: null, degreeId: null,
  fullName: "", nameWithInitials: "", nic: "", dateOfBirth: "",
  maritalStatus: "", email: "", studyMode: "",
  englishProficiency: "", residentialAddress: "", officialAddress: "",
  contacts: [{ type: "MOBILE", value: "" }],
  academics: [emptyAcademic()],
  works: [],
  professionals: [],
  documents: { cv: null, birthCertificate: null, transcript: null, referees: [], budgets: [] },
  ack: { applicationForm: false, signedProposal: false, photographs: false, paymentReceipts: false },
  proposal: { title: "", objectives: "", file: null },
  supervisors: [{ supervisorId: null, isMain: true, cv: null, consent: null }],
};

const input =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black";
const label = "mb-1 block text-sm font-medium text-black";
const card = "rounded-lg border border-border bg-white p-4";

export function RegistrationWizard({
  faculties,
  supervisorOptions,
}: {
  faculties: FacultyNode[];
  supervisorOptions: SupervisorOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const departments = useMemo(
    () => faculties.find((f) => f.id === form.facultyId)?.departments ?? [],
    [faculties, form.facultyId],
  );
  const degrees = useMemo(
    () => departments.find((d) => d.id === form.departmentId)?.degrees ?? [],
    [departments, form.departmentId],
  );
  const selectedDegree = degrees.find((d) => d.id === form.degreeId) ?? null;

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!form.facultyId || !form.departmentId || !form.degreeId)
        return "Select faculty, department and degree.";
      if (!form.fullName.trim() || !form.nameWithInitials.trim())
        return "Full name and name with initials are required.";
      if (!form.nic.trim()) return "NIC is required.";
      if (!form.dateOfBirth) return "Date of birth is required.";
      if (!form.email.trim()) return "Email is required.";
      if (!form.studyMode) return "Select a study mode.";
      if (!form.contacts.some((c) => c.value.trim()))
        return "Provide at least one contact number.";
    }
    if (s === 1) {
      if (form.academics.length === 0) return "Add at least one academic qualification.";
      for (const a of form.academics) {
        if (!a.university.trim() || !a.degreeName.trim())
          return "University and degree name are required for each qualification.";
      }
    }
    if (s === 2) {
      for (const w of form.works)
        if (!w.organization.trim() || !w.periodFrom)
          return "Organization and start date are required for each work experience.";
    }
    if (s === 3) {
      for (const p of form.professionals)
        if (!p.institution.trim())
          return "Institution is required for each professional qualification.";
    }
    if (s === 5) {
      if (!form.proposal.title.trim()) return "Proposal title is required.";
      if (!form.proposal.objectives.trim()) return "Research objectives are required.";
      if (!form.proposal.file) return "Upload the proposal PDF.";
      if (form.supervisors.length === 0) return "Add at least one supervisor.";
      if (form.supervisors.some((s) => !s.supervisorId))
        return "Select a supervisor for each entry.";
      const ids = form.supervisors.map((s) => s.supervisorId);
      if (new Set(ids).size !== ids.length)
        return "Each supervisor can be selected only once.";
      if (form.supervisors.filter((s) => s.isMain).length !== 1)
        return "Mark exactly one main supervisor.";
      // Each supervisor needs a CV and a willingness-to-supervise document.
      if (form.supervisors.some((s) => !s.cv))
        return "Upload a CV for each supervisor.";
      if (form.supervisors.some((s) => !s.consent))
        return "Upload the willingness-to-supervise document for each supervisor.";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0 });
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  }

  async function submit() {
    // Final guard across all steps.
    for (let s = 0; s <= 5; s++) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        setStep(s);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        facultyId: form.facultyId, departmentId: form.departmentId, degreeId: form.degreeId,
        fullName: form.fullName.trim(), nameWithInitials: form.nameWithInitials.trim(),
        nic: form.nic.trim(), dateOfBirth: form.dateOfBirth,
        maritalStatus: form.maritalStatus || null, email: form.email.trim(),
        studyMode: form.studyMode, englishProficiency: form.englishProficiency.trim() || null,
        residentialAddress: form.residentialAddress.trim() || null,
        officialAddress: form.officialAddress.trim() || null,
        contacts: form.contacts.filter((c) => c.value.trim()),
        academics: form.academics,
        works: form.works,
        professionals: form.professionals,
        documents: form.documents,
        proposal: { title: form.proposal.title.trim(), objectives: form.proposal.objectives.trim(), file: form.proposal.file },
        supervisors: form.supervisors,
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }
      router.push(`/register/success?id=${data.applicationId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded-full border px-3 py-1 font-medium ${
              i === step
                ? "border-black bg-black text-white"
                : i < step
                  ? "border-black bg-white text-black"
                  : "border-border bg-white text-neutral-400"
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="space-y-4">
        {step === 0 && (
          <StepPersonal
            form={form} set={set} faculties={faculties}
            departments={departments} degrees={degrees} selectedDegree={selectedDegree}
          />
        )}
        {step === 1 && <StepAcademics form={form} set={set} />}
        {step === 2 && <StepWorks form={form} set={set} />}
        {step === 3 && <StepProfessionals form={form} set={set} />}
        {step === 4 && <StepDocuments form={form} set={set} />}
        {step === 5 && <StepProposal form={form} set={set} supervisorOptions={supervisorOptions} />}
        {step === 6 && (
          <StepReview
            form={form}
            faculties={faculties}
            selectedDegree={selectedDegree}
            supervisorOptions={supervisorOptions}
          />
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm text-black">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-black hover:border-black disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Step 0: Programme & Personal ---------------------------------------

function StepPersonal({
  form, set, faculties, departments, degrees, selectedDegree,
}: {
  form: Form; set: (p: Partial<Form>) => void; faculties: FacultyNode[];
  departments: DeptNode[]; degrees: DegreeNode[]; selectedDegree: DegreeNode | null;
}) {
  return (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="mb-3 text-base font-bold text-black">Programme</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={label}>Faculty</label>
            <select
              className={input}
              value={form.facultyId ?? ""}
              onChange={(e) =>
                set({ facultyId: Number(e.target.value) || null, departmentId: null, degreeId: null })
              }
            >
              <option value="">Select faculty…</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Department</label>
            <select
              className={input}
              value={form.departmentId ?? ""}
              disabled={!form.facultyId}
              onChange={(e) => set({ departmentId: Number(e.target.value) || null, degreeId: null })}
            >
              <option value="">Select department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Degree sought</label>
            <select
              className={input}
              value={form.degreeId ?? ""}
              disabled={!form.departmentId}
              onChange={(e) =>
                // Reset study mode: the allowed modes depend on the chosen degree.
                set({ degreeId: Number(e.target.value) || null, studyMode: "" })
              }
            >
              <option value="">Select degree…</option>
              {degrees.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Study mode</label>
            <select
              className={input}
              value={form.studyMode}
              disabled={!selectedDegree}
              onChange={(e) => set({ studyMode: e.target.value as Form["studyMode"] })}
            >
              <option value="">
                {selectedDegree ? "Select…" : "Select a degree first"}
              </option>
              {selectedDegree?.studyModes.includes("FULL_TIME") && (
                <option value="FULL_TIME">Full time</option>
              )}
              {selectedDegree?.studyModes.includes("PART_TIME") && (
                <option value="PART_TIME">Part time</option>
              )}
            </select>
          </div>
          <div className="flex items-end">
            {selectedDegree && form.studyMode && (
              <p className="text-sm text-neutral-600">
                Programme duration:{" "}
                <strong className="text-black">
                  {durationLabel(selectedDegree.level, form.studyMode as "FULL_TIME" | "PART_TIME")}
                </strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="mb-3 text-base font-bold text-black">Personal details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Full name</label>
            <input className={input} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Name with initials</label>
            <input className={input} value={form.nameWithInitials} onChange={(e) => set({ nameWithInitials: e.target.value })} />
          </div>
          <div>
            <label className={label}>NIC</label>
            <input className={input} value={form.nic} onChange={(e) => set({ nic: e.target.value })} />
          </div>
          <div>
            <label className={label}>Date of birth</label>
            <input type="date" className={input} value={form.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />
          </div>
          <div>
            <label className={label}>Marital status</label>
            <select className={input} value={form.maritalStatus} onChange={(e) => set({ maritalStatus: e.target.value as Form["maritalStatus"] })}>
              <option value="">Select…</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
            </select>
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" className={input} value={form.email} onChange={(e) => set({ email: e.target.value })} />
          </div>
          <div>
            <label className={label}>English proficiency / level</label>
            <select className={input} value={form.englishProficiency} onChange={(e) => set({ englishProficiency: e.target.value })}>
              <option value="">Select…</option>
              {ENGLISH_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Residential address</label>
            <input className={input} value={form.residentialAddress} onChange={(e) => set({ residentialAddress: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Official address (optional)</label>
            <input className={input} value={form.officialAddress} onChange={(e) => set({ officialAddress: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold text-black">Contact numbers</h3>
          <button
            type="button"
            className="text-xs font-medium text-black underline"
            onClick={() => set({ contacts: [...form.contacts, { type: "MOBILE", value: "" }] })}
          >
            + Add number
          </button>
        </div>
        <p className="mb-2 text-xs text-neutral-500">At least one number is required.</p>
        <div className="space-y-2">
          {form.contacts.map((c, i) => (
            <div key={i} className="flex gap-2">
              <select
                className="w-44 rounded-md border border-border bg-white px-2 py-2 text-sm"
                value={c.type}
                onChange={(e) => {
                  const contacts = [...form.contacts];
                  contacts[i] = { ...c, type: e.target.value as Contact["type"] };
                  set({ contacts });
                }}
              >
                <option value="MOBILE">Mobile / Personal</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="OFFICE">Office</option>
                <option value="MOBILE_OFFICE">Mobile (Office)</option>
              </select>
              <input
                className={input}
                placeholder="Number"
                value={c.value}
                onChange={(e) => {
                  const contacts = [...form.contacts];
                  contacts[i] = { ...c, value: e.target.value };
                  set({ contacts });
                }}
              />
              {form.contacts.length > 1 && (
                <button
                  type="button"
                  className="shrink-0 text-xs text-neutral-500 underline"
                  onClick={() => set({ contacts: form.contacts.filter((_, j) => j !== i) })}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Step 1: Academic Qualifications ------------------------------------

function StepAcademics({ form, set }: { form: Form; set: (p: Partial<Form>) => void }) {
  const update = (i: number, patch: Partial<Academic>) => {
    const academics = [...form.academics];
    academics[i] = { ...academics[i], ...patch };
    set({ academics });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Academic qualifications are compulsory. Add one or more, each with a
        certified copy of the certificate.
      </p>
      {form.academics.map((a, i) => (
        <div key={i} className={card}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-black">Qualification {i + 1}</h3>
            {form.academics.length > 1 && (
              <button type="button" className="text-xs text-neutral-500 underline"
                onClick={() => set({ academics: form.academics.filter((_, j) => j !== i) })}>
                Remove
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label}>University</label>
              <input className={input} value={a.university} onChange={(e) => update(i, { university: e.target.value })} /></div>
            <div><label className={label}>Degree name</label>
              <input className={input} value={a.degreeName} onChange={(e) => update(i, { degreeName: e.target.value })} /></div>
            <div><label className={label}>Class</label>
              <input className={input} value={a.degreeClass} onChange={(e) => update(i, { degreeClass: e.target.value })} /></div>
            <div><label className={label}>GPA</label>
              <input className={input} value={a.gpa} onChange={(e) => update(i, { gpa: e.target.value })} /></div>
            <div><label className={label}>Credits covered</label>
              <input className={input} value={a.creditCount} onChange={(e) => update(i, { creditCount: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={label}>From</label>
                <input type="date" className={input} value={a.periodFrom} onChange={(e) => update(i, { periodFrom: e.target.value })} /></div>
              <div><label className={label}>To</label>
                <input type="date" className={input} value={a.periodTo} onChange={(e) => update(i, { periodTo: e.target.value })} /></div>
            </div>
            <div className="sm:col-span-2">
              <FileField label="Certificate (proof)" folder="academic" value={a.file} onChange={(f) => update(i, { file: f })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="rounded-md border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white"
        onClick={() => set({ academics: [...form.academics, emptyAcademic()] })}>
        + Add qualification
      </button>
    </div>
  );
}

// ---- Step 2: Work Experience --------------------------------------------

function StepWorks({ form, set }: { form: Form; set: (p: Partial<Form>) => void }) {
  const update = (i: number, patch: Partial<Work>) => {
    const works = [...form.works];
    works[i] = { ...works[i], ...patch };
    set({ works });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">Optional. Add any work experience with a work-experience letter.</p>
      {form.works.map((w, i) => (
        <div key={i} className={card}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-black">Experience {i + 1}</h3>
            <button type="button" className="text-xs text-neutral-500 underline"
              onClick={() => set({ works: form.works.filter((_, j) => j !== i) })}>Remove</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label}>Organization</label>
              <input className={input} value={w.organization} onChange={(e) => update(i, { organization: e.target.value })} /></div>
            <div><label className={label}>Position held</label>
              <input className={input} value={w.positionHeld} onChange={(e) => update(i, { positionHeld: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={label}>From</label>
                <input type="date" className={input} value={w.periodFrom} onChange={(e) => update(i, { periodFrom: e.target.value })} /></div>
              <div><label className={label}>To</label>
                <input type="date" className={input} value={w.periodTo} onChange={(e) => update(i, { periodTo: e.target.value })} /></div>
            </div>
            <div className="sm:col-span-2">
              <FileField label="Work experience letter (proof)" folder="work" value={w.file} onChange={(f) => update(i, { file: f })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="rounded-md border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white"
        onClick={() => set({ works: [...form.works, emptyWork()] })}>
        + Add work experience
      </button>
    </div>
  );
}

// ---- Step 3: Professional Experience ------------------------------------

function StepProfessionals({ form, set }: { form: Form; set: (p: Partial<Form>) => void }) {
  const update = (i: number, patch: Partial<Professional>) => {
    const professionals = [...form.professionals];
    professionals[i] = { ...professionals[i], ...patch };
    set({ professionals });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">Optional. Add any professional qualifications with proof.</p>
      {form.professionals.map((p, i) => (
        <div key={i} className={card}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-black">Professional {i + 1}</h3>
            <button type="button" className="text-xs text-neutral-500 underline"
              onClick={() => set({ professionals: form.professionals.filter((_, j) => j !== i) })}>Remove</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label}>Institution</label>
              <input className={input} value={p.institution} onChange={(e) => update(i, { institution: e.target.value })} /></div>
            <div><label className={label}>Field of study</label>
              <input className={input} value={p.fieldOfStudy} onChange={(e) => update(i, { fieldOfStudy: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={label}>From</label>
                <input type="date" className={input} value={p.periodFrom} onChange={(e) => update(i, { periodFrom: e.target.value })} /></div>
              <div><label className={label}>To</label>
                <input type="date" className={input} value={p.periodTo} onChange={(e) => update(i, { periodTo: e.target.value })} /></div>
            </div>
            <div className="sm:col-span-2">
              <FileField label="Certificate (proof)" folder="professional" value={p.file} onChange={(f) => update(i, { file: f })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="rounded-md border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white"
        onClick={() => set({ professionals: [...form.professionals, emptyProf()] })}>
        + Add professional qualification
      </button>
    </div>
  );
}

// ---- Step 4: Documents ---------------------------------------------------

function MultiFile({ files, onChange, folder, label: lbl }: {
  files: UploadedRef[]; onChange: (f: UploadedRef[]) => void; folder: string; label: string;
}) {
  return (
    <div className={card}>
      <h3 className="mb-2 text-base font-bold text-black">{lbl}</h3>
      <ul className="mb-2 space-y-1">
        {files.map((f, i) => (
          <li key={i} className="flex items-center justify-between rounded border border-black bg-neutral-50 px-3 py-1.5 text-sm">
            <span className="truncate text-black">✓ {f.fileName}</span>
            <button type="button" className="text-xs text-neutral-600 underline"
              onClick={() => onChange(files.filter((_, j) => j !== i))}>Remove</button>
          </li>
        ))}
      </ul>
      <FileField folder={folder} value={null} onChange={(f) => f && onChange([...files, f])} />
    </div>
  );
}

function StepDocuments({ form, set }: { form: Form; set: (p: Partial<Form>) => void }) {
  const doc = form.documents;
  const setDoc = (patch: Partial<Form["documents"]>) => set({ documents: { ...doc, ...patch } });
  const ack = form.ack;
  const setAck = (patch: Partial<Form["ack"]>) => set({ ack: { ...ack, ...patch } });

  return (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="mb-3 text-base font-bold text-black">Uploads</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FileField label="Curriculum Vitae (CV)" folder="cv" value={doc.cv} onChange={(f) => setDoc({ cv: f })} />
          <FileField label="Certified copy of Birth Certificate" folder="birth-certificate" value={doc.birthCertificate} onChange={(f) => setDoc({ birthCertificate: f })} />
          <FileField label="Academic Transcripts" folder="transcript" value={doc.transcript} onChange={(f) => setDoc({ transcript: f })} />
        </div>
      </div>

      <MultiFile label="Referee Reports (one or more)" folder="referee" files={doc.referees} onChange={(referees) => setDoc({ referees })} />
      <MultiFile label="Proposed Budget + Funding Evidence (one or more)" folder="budget" files={doc.budgets} onChange={(budgets) => setDoc({ budgets })} />

      <div className={card}>
        <h3 className="mb-2 text-base font-bold text-black">Physical submissions — acknowledge</h3>
        <p className="mb-3 text-xs text-neutral-500">These are handed over in person. Tick to confirm you will submit them.</p>
        <div className="space-y-2 text-sm">
          {([
            ["applicationForm", "Completed Application Form with signature"],
            ["signedProposal", "Two (02) copies of research proposal signed by supervisors"],
            ["photographs", "Three (03) passport-size colour photographs"],
            ["paymentReceipts", "Receipts of relevant payments (incl. application lodging fee)"],
          ] as const).map(([key, text]) => (
            <label key={key} className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={ack[key]} onChange={(e) => setAck({ [key]: e.target.checked })} />
              <span className="text-black">{text}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Step 5: Proposal & Supervisors -------------------------------------

function StepProposal({
  form,
  set,
  supervisorOptions,
}: {
  form: Form;
  set: (p: Partial<Form>) => void;
  supervisorOptions: SupervisorOption[];
}) {
  const prop = form.proposal;
  const setProp = (patch: Partial<Form["proposal"]>) => set({ proposal: { ...prop, ...patch } });
  const updateSup = (i: number, patch: Partial<Supervisor>) => {
    const supervisors = [...form.supervisors];
    supervisors[i] = { ...supervisors[i], ...patch };
    set({ supervisors });
  };
  const setMain = (i: number) =>
    set({ supervisors: form.supervisors.map((s, j) => ({ ...s, isMain: j === i })) });

  const supLabel = (o: SupervisorOption) =>
    [o.title, o.name].filter(Boolean).join(" ") +
    (o.university ? ` — ${o.university}` : "");

  return (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="mb-3 text-base font-bold text-black">Research proposal</h3>
        <div className="space-y-3">
          <div><label className={label}>Project title</label>
            <input className={input} value={prop.title} onChange={(e) => setProp({ title: e.target.value })} /></div>
          <div><label className={label}>Research objectives</label>
            <textarea className={`${input} min-h-28`} value={prop.objectives} onChange={(e) => setProp({ objectives: e.target.value })} /></div>
          <FileField label="Proposal file (PDF)" folder="proposal" accept=".pdf" value={prop.file} onChange={(f) => setProp({ file: f })} />
        </div>
      </div>

      <div className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold text-black">Supervisors</h3>
          {form.supervisors.length < 5 && (
            <button type="button" className="text-xs font-medium text-black underline"
              onClick={() => set({ supervisors: [...form.supervisors, { supervisorId: null, isMain: false, cv: null, consent: null }] })}>
              + Add supervisor
            </button>
          )}
        </div>
        <p className="mb-3 text-xs text-neutral-500">
          1 to 5 supervisors. Select each from the list, mark exactly one main
          supervisor, and for each upload their CV and a document showing they
          are willing to supervise this research.
        </p>
        {supervisorOptions.length === 0 && (
          <p className="mb-3 rounded-md border border-black bg-neutral-50 px-3 py-2 text-sm text-black">
            No supervisors have been published yet. Please contact the postgraduate
            office before completing this step.
          </p>
        )}
        <div className="space-y-3">
          {form.supervisors.map((s, i) => {
            const chosenElsewhere = new Set(
              form.supervisors.filter((_, j) => j !== i).map((x) => x.supervisorId),
            );
            return (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className={label}>Supervisor</label>
                  <select
                    className={input}
                    value={s.supervisorId ?? ""}
                    onChange={(e) => updateSup(i, { supervisorId: Number(e.target.value) || null })}
                  >
                    <option value="">Select supervisor…</option>
                    {supervisorOptions.map((o) => (
                      <option key={o.id} value={o.id} disabled={chosenElsewhere.has(o.id)}>
                        {supLabel(o)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-black">
                    <input type="radio" name="mainSupervisor" checked={s.isMain} onChange={() => setMain(i)} />
                    Main supervisor
                  </label>
                  {form.supervisors.length > 1 && (
                    <button type="button" className="text-xs text-neutral-500 underline"
                      onClick={() => {
                        const remaining = form.supervisors.filter((_, j) => j !== i);
                        // Ensure one main remains.
                        if (!remaining.some((x) => x.isMain) && remaining[0]) remaining[0].isMain = true;
                        set({ supervisors: remaining });
                      }}>
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <FileField label="Supervisor CV" folder="supervisor-cv" value={s.cv} onChange={(f) => updateSup(i, { cv: f })} />
                </div>
                <div>
                  <FileField label="Willingness-to-supervise document" folder="supervisor-consent" value={s.consent} onChange={(f) => updateSup(i, { consent: f })} />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Step 6: Review ------------------------------------------------------

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-neutral-500">{k}</span>
      <span className="text-right font-medium text-black">{v || "—"}</span>
    </div>
  );
}

function StepReview({ form, faculties, selectedDegree, supervisorOptions }: {
  form: Form; faculties: FacultyNode[]; selectedDegree: DegreeNode | null;
  supervisorOptions: SupervisorOption[];
}) {
  const faculty = faculties.find((f) => f.id === form.facultyId);
  const dept = faculty?.departments.find((d) => d.id === form.departmentId);
  const nameOf = (id: number | null) =>
    supervisorOptions.find((o) => o.id === id)?.name ?? "";
  const main = form.supervisors.find((s) => s.isMain);
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">Review your details, then submit. Use Back to make changes.</p>
      <div className={card}>
        <h3 className="mb-2 text-base font-bold text-black">Programme & Personal</h3>
        <Row k="Faculty" v={faculty?.name} />
        <Row k="Department" v={dept?.name} />
        <Row k="Degree" v={selectedDegree?.name} />
        <Row k="Study mode" v={form.studyMode === "FULL_TIME" ? "Full time" : form.studyMode === "PART_TIME" ? "Part time" : ""} />
        <Row k="Full name" v={form.fullName} />
        <Row k="Name with initials" v={form.nameWithInitials} />
        <Row k="NIC" v={form.nic} />
        <Row k="Date of birth" v={form.dateOfBirth} />
        <Row k="Email" v={form.email} />
        <Row k="Contacts" v={form.contacts.filter((c) => c.value).map((c) => c.value).join(", ")} />
      </div>
      <div className={card}>
        <h3 className="mb-2 text-base font-bold text-black">Qualifications</h3>
        <Row k="Academic qualifications" v={`${form.academics.length}`} />
        <Row k="Work experience" v={`${form.works.length}`} />
        <Row k="Professional qualifications" v={`${form.professionals.length}`} />
      </div>
      <div className={card}>
        <h3 className="mb-2 text-base font-bold text-black">Proposal & Supervisors</h3>
        <Row k="Title" v={form.proposal.title} />
        <Row k="Proposal file" v={form.proposal.file?.fileName} />
        <Row k="Main supervisor" v={main ? nameOf(main.supervisorId) : ""} />
        <Row k="Supervisors" v={form.supervisors.map((s) => nameOf(s.supervisorId)).filter(Boolean).join(", ")} />
      </div>
    </div>
  );
}
