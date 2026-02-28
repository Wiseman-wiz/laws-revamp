"use client";

import React from "react";
import { CaseField } from "@/types/case";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";

interface CaseTypePreviewProps {
  name: string;
  fields: CaseField[];
}

export function CaseTypePreview({ name, fields }: CaseTypePreviewProps) {
  return (
    <Card className="h-full border-none shadow-sm bg-slate-50/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-white/50">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </CardTitle>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-6 bg-white flex-1 min-h-[500px]">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-semibold">
            {name ? `New ${name} Submission` : "New Case Submission"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Example of how your form looks to users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {fields.map((field) => (
            <div
              key={field.id}
              className={
                field.attributes.colSpan === 4 ? "md:col-span-4" :
                field.attributes.colSpan === 3 ? "md:col-span-3" :
                field.attributes.colSpan === 2 ? "md:col-span-2" :
                "md:col-span-1"
              }
            >
              <Label className="text-sm font-medium mb-1.5 block">
                {field.label || "Untitled Field"}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === "dropdown" ? (
                <Select disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.attributes.placeholder || "Select..."} />
                  </SelectTrigger>
                </Select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox disabled />
                  <span className="text-sm text-muted-foreground">
                    {field.attributes.placeholder || "Yes/No"}
                  </span>
                </div>
              ) : field.type === "textarea" ? (
                <textarea
                  disabled
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={field.attributes.placeholder || "Enter..."}
                />
              ) : (
                <Input
                  disabled
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  placeholder={field.attributes.placeholder || (field.type === "date" ? "mm/dd/yyyy" : "Enter...")}
                />
              )}
            </div>
          ))}
        </div>

        {fields.length > 0 && (
          <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white" disabled>
            Submit Case
          </Button>
        )}

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50/50">
            <p className="text-sm">No fields added yet</p>
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t bg-slate-50/50 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          Dynamic visual representation of the builder on the left.
        </p>
      </div>
    </Card>
  );
}
