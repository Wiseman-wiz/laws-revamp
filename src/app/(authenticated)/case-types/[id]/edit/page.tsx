import { CaseTypeForm } from "@/components/case-type/case-type-form";
import { getCaseTypes } from "@/app/actions/case-types";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditCaseTypePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "Supervisor") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const caseTypes = await getCaseTypes();
  const caseType = caseTypes.find((ct) => ct._id!.toString() === id);

  if (!caseType) {
    notFound();
  }

  return <CaseTypeForm initialData={caseType} />;
}
