"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CaseType } from "@/types/case";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createCaseRecord } from "@/app/actions/case-records";

interface CaseRecordFormProps {
  caseType: CaseType;
}

export function CaseRecordForm({ caseType }: CaseRecordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Generate dynamic Zod schema based on case type fields
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  caseType.fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny = z.any();

    if (field.type === "text" || field.type === "textarea" || field.type === "dropdown") {
      fieldSchema = z.string();
      if (field.required) {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
      } else {
        fieldSchema = (fieldSchema as z.ZodString).optional().or(z.literal(""));
      }
    } else if (field.type === "number") {
      fieldSchema = z.coerce.number();
      if (field.required) {
        fieldSchema = (fieldSchema as z.ZodNumber);
      } else {
        fieldSchema = (fieldSchema as z.ZodNumber).optional();
      }
    } else if (field.type === "checkbox") {
      fieldSchema = z.boolean().default(false);
    } else if (field.type === "date") {
      fieldSchema = z.string(); // Dates usually come as strings from inputs
      if (field.required) {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
      } else {
        fieldSchema = (fieldSchema as z.ZodString).optional().or(z.literal(""));
      }
    }

    schemaObject[field.key] = fieldSchema;
  });

  const formSchema = z.object(schemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: caseType.fields.reduce((acc, field) => {
      acc[field.key] = field.type === "checkbox" ? false : "";
      return acc;
    }, {} as Record<string, string | number | boolean>),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await createCaseRecord(
        caseType._id!.toString(),
        values as Record<string, string | number | boolean | null>
      );
      router.push(`/cases/${caseType.slug}`);
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
    <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>New {caseType.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {caseType.fields.map((field) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.key}
                  render={({ field: formField }) => (
                    <FormItem className={
                      field.attributes.colSpan === 4 ? "md:col-span-4" :
                      field.attributes.colSpan === 3 ? "md:col-span-3" :
                      field.attributes.colSpan === 2 ? "md:col-span-2" :
                      "md:col-span-1"
                    }>
                      <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                      <FormControl>
                        {field.type === "dropdown" ? (
                          <Select onValueChange={formField.onChange} defaultValue={String(formField.value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={field.attributes.placeholder || `Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center space-x-2">
                             <Checkbox
                               checked={!!formField.value}
                               onCheckedChange={formField.onChange}
                             />
                             <span className="text-sm text-muted-foreground">{field.attributes.placeholder || "Yes/No"}</span>
                          </div>
                        ) : field.type === "textarea" ? (
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={field.attributes.placeholder}
                            {...formField}
                            value={String(formField.value ?? "")}
                          />
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            placeholder={field.attributes.placeholder}
                            {...formField}
                            value={String(formField.value ?? "")}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : `Create ${caseType.name}`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
