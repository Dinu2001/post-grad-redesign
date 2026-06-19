const ITEMS: { n: number; title: string; mode: "Upload" | "Physical"; note: string }[] =
  [
    {
      n: 1,
      title: "Completed Application Form with Signature",
      mode: "Physical",
      note: "Physical submission only.",
    },
    {
      n: 2,
      title: "Complete Curriculum Vitae (CV)",
      mode: "Upload",
      note: "Online and physical. Student's CV and each supervisor's CV.",
    },
    {
      n: 3,
      title: "Certified Copy of the Birth Certificate",
      mode: "Upload",
      note: "Online and physical submission.",
    },
    {
      n: 4,
      title: "Certified Copies of Educational Certificates",
      mode: "Upload",
      note: "Attach to each Academic Qualification.",
    },
    {
      n: 5,
      title: "Certified Copies of Professional Qualification Certificates",
      mode: "Upload",
      note: "Attach to each Professional Qualification.",
    },
    {
      n: 6,
      title: "Academic Transcripts",
      mode: "Upload",
      note: "Online and physical submission.",
    },
    {
      n: 7,
      title: "Two (02) Copies of Research Proposal Signed by Supervisors",
      mode: "Physical",
      note: "Physical submission only.",
    },
    {
      n: 8,
      title: "Two (02) Referee Reports",
      mode: "Upload",
      note: "Online and physical. One or more files.",
    },
    {
      n: 9,
      title: "Proposed Budget + Evidence of Funding / Financial Support",
      mode: "Upload",
      note: "Online and physical. One or more files.",
    },
    {
      n: 10,
      title: "Three (03) Passport-size Colour Photographs",
      mode: "Physical",
      note: "Physical submission only.",
    },
    {
      n: 11,
      title: "Receipts of Relevant Payments (incl. Application Lodging Fee)",
      mode: "Physical",
      note: "Physical submission only.",
    },
    {
      n: 12,
      title: "Work Experience Letters",
      mode: "Upload",
      note: "Attach to each Work Experience.",
    },
  ];

export function Checklist() {
  return (
    <section className="mb-8 rounded-lg border border-black bg-white p-6">
      <h2 className="text-lg font-bold text-black">Application checklist</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Before you begin, make sure you have the following ready. Items marked{" "}
        <strong>Upload</strong> are submitted online in this form; items marked{" "}
        <strong>Physical</strong> are handed over in person and you simply
        acknowledge them here. Your signed research proposal is submitted online
        too.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {ITEMS.map((it) => (
          <li
            key={it.n}
            className="flex gap-3 rounded-md border border-border p-3 text-sm"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              {it.n}
            </span>
            <div>
              <p className="font-medium text-black">{it.title}</p>
              <p className="text-xs text-neutral-500">
                <span
                  className={`mr-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    it.mode === "Upload"
                      ? "bg-black text-white"
                      : "border border-black text-black"
                  }`}
                >
                  {it.mode}
                </span>
                {it.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
