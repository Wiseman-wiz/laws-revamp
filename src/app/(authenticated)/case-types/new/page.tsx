import { CaseTypeForm } from "@/components/case-type/case-type-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewCaseTypePage() {
  const session = await auth();
  if (session?.user?.role !== "Supervisor") {
    redirect("/dashboard");
  }

  return <CaseTypeForm />;
}
