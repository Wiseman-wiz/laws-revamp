"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CaseField, FieldType } from "@/types/case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, Trash2, Plus, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface FieldBuilderProps {
  fields: CaseField[];
  onChange: (fields: CaseField[]) => void;
}

export function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = () => {
    const newField: CaseField = {
      id: Math.random().toString(36).substring(7),
      key: "",
      label: "",
      type: "text",
      required: false,
      options: null,
      attributes: {
        colSpan: 1,
      },
    };
    onChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CaseField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Fields</h3>
        <Button type="button" onClick={addField} size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Field
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                onRemove={() => removeField(field.id)}
                onUpdate={(updates) => updateField(field.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
          No fields added yet. Click &quot;Add Field&quot; to start building your case type.
        </div>
      )}
    </div>
  );
}

function SortableField({
  field,
  onRemove,
  onUpdate,
}: {
  field: CaseField;
  onRemove: () => void;
  onUpdate: (updates: Partial<CaseField>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
            <div className="md:col-span-1">
              <Input
                placeholder="Field Label"
                value={field.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const key = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                  onUpdate({ label, key });
                }}
              />
            </div>
            <div className="md:col-span-1 text-xs text-muted-foreground flex items-center px-2">
               <code>{field.key}</code>
            </div>
            <div className="md:col-span-1">
              <Select
                value={field.type}
                onValueChange={(value) => onUpdate({ type: value as FieldType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 flex items-center gap-2 justify-end">
               <FieldSettings field={field} onUpdate={onUpdate} />
               <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldSettings({ field, onUpdate }: { field: CaseField, onUpdate: (updates: Partial<CaseField>) => void }) {
  const [optionsText, setOptionsText] = React.useState(
    field.options?.map(o => `${o.label}:${o.value}`).join("\n") || ""
  );

  const handleSave = () => {
    const updates: Partial<CaseField> = {};
    if (field.type === "dropdown") {
      const options = optionsText.split("\n")
        .filter(line => line.includes(":"))
        .map(line => {
          const [label, value] = line.split(":");
          return { label: label.trim(), value: value.trim() };
        });
      updates.options = options.length > 0 ? options : null;
    }
    onUpdate(updates);
  };

  return (
    <Dialog onOpenChange={(open) => { if(!open) handleSave() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Field Settings: {field.label || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`req-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: !!checked })}
            />
            <Label htmlFor={`req-${field.id}`}>Required</Label>
          </div>

          <div className="space-y-2">
            <Label>Layout (Grid Columns)</Label>
            <Select
              value={field.attributes.colSpan?.toString() || "1"}
              onValueChange={(value) => onUpdate({ attributes: { ...field.attributes, colSpan: parseInt(value) as 1 | 2 } })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Column</SelectItem>
                <SelectItem value="2">2 Columns (Full Width)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {field.type === "text" && (
            <div className="space-y-2">
              <Label>Max Length</Label>
              <Input
                type="number"
                value={field.attributes.maxLength || ""}
                onChange={(e) => onUpdate({ attributes: { ...field.attributes, maxLength: parseInt(e.target.value) || undefined } })}
              />
            </div>
          )}

          {field.type === "dropdown" && (
            <div className="space-y-2">
              <Label>Options (Label:Value per line)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Option 1:opt1&#10;Option 2:opt2"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={field.attributes.placeholder || ""}
              onChange={(e) => onUpdate({ attributes: { ...field.attributes, placeholder: e.target.value } })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => handleSave()}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
