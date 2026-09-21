import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="Manage your personal account information."
      />
      <ProfileForm
        fullName={session.fullName}
        email={session.email}
        role={session.role}
      />
    </>
  );
}
