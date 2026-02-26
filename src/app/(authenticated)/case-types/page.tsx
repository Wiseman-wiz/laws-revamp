import { getCaseTypes, hasCaseRecords, deleteCaseType } from "@/app/actions/case-types";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteButton } from "./delete-button";

export default async function CaseTypesPage() {
  const session = await auth();
  if (session?.user?.role !== "Supervisor") {
    redirect("/dashboard");
  }

  const caseTypes = await getCaseTypes();

  // For each case type, check if it has records to determine if it can be edited/deleted
  const caseTypesWithStatus = await Promise.all(
    caseTypes.map(async (ct) => ({
      ...ct,
      canEdit: !(await hasCaseRecords(ct._id!.toString())),
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Case Type Manager</h1>
        <Button asChild>
          <Link href="/case-types/new">
            <Plus className="mr-2 h-4 w-4" /> New Case Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseTypesWithStatus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No case types found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                caseTypesWithStatus.map((ct) => (
                  <TableRow key={ct._id!.toString()}>
                    <TableCell className="font-medium">{ct.name}</TableCell>
                    <TableCell>{ct.slug}</TableCell>
                    <TableCell>{ct.fields.length} fields</TableCell>
                    <TableCell>
                      {ct.canEdit ? (
                        <span className="text-green-600 text-xs font-medium">Editable</span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium">Locked (Has Records)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {ct.canEdit ? (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/case-types/${ct._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteButton id={ct._id!.toString()} />
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
