import Link from "next/link";

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black text-2xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Application submitted
        </h1>
        {id && (
          <p className="mt-2 text-sm text-neutral-600">
            Your application reference is{" "}
            <span className="font-mono font-semibold text-black">#{id}</span>.
          </p>
        )}
        <p className="mt-4 text-sm text-neutral-600">
          Your registration has been received and is pending review by the
          Registrar. If approved, you will receive a portal account by email.
          Remember to hand over the physical-submission items in person.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
