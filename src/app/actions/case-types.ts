"use server";

import clientPromise from "@/lib/db/mongodb";
import { CaseType } from "@/types/case";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function checkSupervisor() {
  const session = await auth();
  if (session?.user?.role !== "Supervisor") {
    throw new Error("Unauthorized");
  }
}

export async function getCaseTypes() {
  const client = await clientPromise;
  const db = client.db();
  const caseTypes = await db.collection("case_types").find({}).sort({ name: 1 }).toArray();

  return caseTypes.map(ct => ({
    ...ct,
    _id: ct._id.toString(),
  })) as CaseType[];
}

export async function getCaseTypeBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db();
  const caseType = await db.collection("case_types").findOne({ slug });

  if (!caseType) return null;

  return {
    ...caseType,
    _id: caseType._id.toString(),
  } as CaseType;
}

export async function getCaseTypeById(id: string) {
  const client = await clientPromise;
  const db = client.db();

  try {
    const caseType = await db.collection("case_types").findOne({ _id: new ObjectId(id) });
    if (!caseType) return null;
    return {
      ...caseType,
      _id: caseType._id.toString(),
    } as CaseType;
  } catch {
    return null;
  }
}

export async function hasCaseRecords(caseTypeId: string) {
  const client = await clientPromise;
  const db = client.db();
  const count = await db.collection("case_records").countDocuments({
    caseTypeId: new ObjectId(caseTypeId)
  });
  return count > 0;
}

export async function createCaseType(data: Omit<CaseType, "_id" | "createdAt" | "updatedAt">) {
  await checkSupervisor();

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection("case_types").insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/");
  return { success: true, id: result.insertedId.toString() };
}

export async function updateCaseType(id: string, data: Omit<CaseType, "_id" | "createdAt" | "updatedAt">) {
  await checkSupervisor();

  const hasRecords = await hasCaseRecords(id);
  if (hasRecords) {
    throw new Error("Cannot edit Case Type that already has records.");
  }

  const client = await clientPromise;
  const db = client.db();

  await db.collection("case_types").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/");
  return { success: true };
}

export async function deleteCaseType(id: string) {
  await checkSupervisor();

  const hasRecords = await hasCaseRecords(id);
  if (hasRecords) {
    throw new Error("Cannot delete Case Type that already has records.");
  }

  const client = await clientPromise;
  const db = client.db();

  await db.collection("case_types").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/");
  return { success: true };
}
