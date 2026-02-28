import { getCaseTypeBySlug } from "@/app/actions/case-types";
import { getCaseRecords } from "@/app/actions/case-records";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CaseRecordsPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const caseType = await getCaseTypeBySlug(slug);

  if (!caseType) {
    notFound();
  }

  const records = await getCaseRecords(caseType._id!.toString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{caseType.name} Records</h1>
        <Button asChild>
          <Link href={`/cases/${slug}/new`}>
            <Plus className="mr-2 h-4 w-4" /> New Record
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total {records.length} records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {caseType.fields.slice(0, 5).map((field) => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={caseType.fields.slice(0, 5).length + 1} className="text-center py-8 text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record._id!.toString()}>
                      {caseType.fields.slice(0, 5).map((field) => (
                        <TableCell key={field.id}>
                          {String(record.data[field.key] ?? "-")}
                        </TableCell>
                      ))}
                      <TableCell>
                        {new Date(record.createdAt!).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
