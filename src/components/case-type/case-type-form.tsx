"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CaseType, CaseField } from "@/types/case";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldBuilder } from "./field-builder";
import { useRouter } from "next/navigation";
import { createCaseType, updateCaseType } from "@/app/actions/case-types";
import { CaseTypePreview } from "./case-preview";
import { Minus, Info } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

interface CaseTypeFormProps {
  initialData?: CaseType;
}

export function CaseTypeForm({ initialData }: CaseTypeFormProps) {
  const router = useRouter();
  const [fields, setFields] = React.useState<CaseField[]>(initialData?.fields || []);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
    },
  });

  const watchName = form.watch("name");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Validate fields
      const invalidFields = fields.filter(f => !f.label || f.label.trim() === "");
      if (invalidFields.length > 0) {
        throw new Error("All field names must be filled out and cannot be only spaces.");
      }

      const data = {
        ...values,
        fields,
      };

      if (initialData?._id) {
        await updateCaseType(initialData._id.toString(), data);
      } else {
        await createCaseType(data);
      }

      router.push("/case-types");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An error occurred";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {initialData ? "Edit Case Type" : "Create New Case Type"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Define the properties and data fields for your new business process.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column - Form Builder */}
        <div className="xl:col-span-7">
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Form Builder
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                            Case Type Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Sales Lead"
                              className="bg-slate-50/50"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (!initialData) {
                                  form.setValue(
                                    "slug",
                                    e.target.value
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[^a-z0-9-]/g, "")
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                            Slug
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="sales-lead"
                              className="bg-slate-50/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FieldBuilder fields={fields} onChange={setFields} />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/case-types")}
                      disabled={loading}
                      className="text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-slate-900 text-white hover:bg-slate-800 px-6"
                    >
                      {loading
                        ? "Saving..."
                        : initialData
                        ? "Update Case Type"
                        : "Create Case Type"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-3">
            <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 mb-0.5">Pro Tip:</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Drag and drop fields to reorder. The preview on the right will update in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="xl:col-span-5 sticky top-[100px]">
          <CaseTypePreview name={watchName} fields={fields} />
        </div>
      </div>
    </div>
  );
}
