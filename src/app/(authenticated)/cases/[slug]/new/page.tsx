import { getCaseTypeBySlug } from "@/app/actions/case-types";
import { CaseRecordForm } from "@/components/case-record/case-record-form";
import { notFound } from "next/navigation";

export default async function NewCaseRecordPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const caseType = await getCaseTypeBySlug(slug);

  if (!caseType) {
    notFound();
  }

  return (
    <div className="py-6">
      <CaseRecordForm caseType={caseType} />
    </div>
  );
}
