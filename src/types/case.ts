import { ObjectId } from "mongodb";

export type FieldType = "text" | "number" | "dropdown" | "date" | "checkbox" | "textarea";

export interface CaseFieldOption {
  label: string;
  value: string;
}

export interface CaseField {
  id: string; // Used for client-side sorting/dnd
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: CaseFieldOption[] | null;
  attributes: {
    maxLength?: number;
    colSpan?: 1 | 2;
    placeholder?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface CaseType {
  _id?: string | ObjectId;
  name: string;
  slug: string;
  fields: CaseField[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CaseRecord {
  _id?: string | ObjectId;
  caseTypeId: string | ObjectId;
  data: Record<string, string | number | boolean | null>;
  createdAt?: Date;
  updatedAt?: Date;
}
