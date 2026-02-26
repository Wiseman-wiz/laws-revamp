"use server";

import clientPromise from "@/lib/db/mongodb";
import { CaseRecord } from "@/types/case";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getCaseRecords(caseTypeId: string) {
  const client = await clientPromise;
  const db = client.db();
  const records = await db.collection("case_records")
    .find({ caseTypeId: new ObjectId(caseTypeId) })
    .sort({ createdAt: -1 })
    .toArray();

  return records.map(r => ({
    ...r,
    _id: r._id.toString(),
    caseTypeId: r.caseTypeId.toString(),
  })) as CaseRecord[];
}

export async function createCaseRecord(caseTypeId: string, data: Record<string, string | number | boolean | null>) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection("case_records").insertOne({
    caseTypeId: new ObjectId(caseTypeId),
    data,
    createdBy: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/cases`);
  return { success: true, id: result.insertedId.toString() };
}
