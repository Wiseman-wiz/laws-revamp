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
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CaseField, FieldType, CaseFieldOption } from "@/types/case";
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
import { GripVertical, Trash2, Plus, Settings2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
    setActiveId(null);
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

  const activeField = fields.find((f) => f.id === activeId);

  return (
    <DndContext
      id="field-builder-dnd"
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-muted-foreground">Fields</h3>
          <Button
            type="button"
            onClick={addField}
            size="sm"
            variant="outline"
            className="h-8 text-xs bg-white border-dashed"
          >
            <Plus className="mr-1 h-3 w-3" /> Add Field
          </Button>
        </div>

        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
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

        <DragOverlay modifiers={[restrictToVerticalAxis]}>
          {activeField ? (
            <div className="w-full opacity-80">
               <Card className="shadow-xl border-blue-500 bg-white">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="text-blue-500 p-1">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 items-center">
                    <div className="md:col-span-5">
                      <Input readOnly value={activeField.label} className="h-9 text-sm bg-slate-50" />
                    </div>
                    <div className="md:col-span-4">
                       <div className="h-9 px-3 flex items-center text-sm bg-slate-50 border rounded-md">
                         {activeField.type.charAt(0).toUpperCase() + activeField.type.slice(1)}
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>

        {fields.length === 0 && (
          <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground bg-slate-50/30">
            <p className="text-sm">No fields added yet.</p>
            <p className="text-xs">Click &quot;Add Field&quot; to start building your form.</p>
          </div>
        )}
      </div>
    </DndContext>
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
  const isInvalid = !field.label || field.label.trim() === "";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="shadow-none border border-slate-200 hover:border-slate-300 transition-colors bg-white">
        <CardContent className="p-3 flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 p-1"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 items-center">
            <div className="md:col-span-5 relative">
              <Input
                placeholder="e.g. First Name"
                value={field.label}
                className={cn(
                  "h-9 text-sm",
                  isInvalid && "border-destructive focus-visible:ring-destructive pr-8"
                )}
                onChange={(e) => {
                  const label = e.target.value;
                  const key = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                  onUpdate({ label, key });
                }}
              />
              {isInvalid && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive">
                   <AlertCircle className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="md:col-span-4">
              <Select
                value={field.type}
                onValueChange={(value) => onUpdate({ type: value as FieldType })}
              >
                <SelectTrigger className="h-9 text-sm">
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

            <div className="md:col-span-3 flex items-center gap-1 justify-end">
               <FieldSettings field={field} onUpdate={onUpdate} />
               <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/5"
               >
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
  const [localOptions, setLocalOptions] = React.useState<CaseFieldOption[]>(field.options || []);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalOptions(field.options || []);
  }, [field.options]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleOptionsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localOptions.findIndex((o) => o.id === active.id);
      const newIndex = localOptions.findIndex((o) => o.id === over.id);
      const newOptions = arrayMove(localOptions, oldIndex, newIndex);
      setLocalOptions(newOptions);
      // Immediately update parent to avoid sync issues
      onUpdate({ options: newOptions });
    }
    setActiveId(null);
  };

  const addOption = () => {
    const newOption: CaseFieldOption = {
      id: Math.random().toString(36).substring(7),
      label: "",
      value: "",
    };
    setLocalOptions([...localOptions, newOption]);
  };

  const updateOption = (id: string, updates: Partial<CaseFieldOption>) => {
    setLocalOptions(localOptions.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const removeOption = (id: string) => {
    setLocalOptions(localOptions.filter(o => o.id !== id));
  };

  const handleSave = () => {
    const updates: Partial<CaseField> = {};
    if (field.type === "dropdown") {
      updates.options = localOptions.length > 0 ? localOptions : null;
    }
    onUpdate(updates);
  };

  const isOptionInvalid = (opt: CaseFieldOption) => !opt.label.trim() || !opt.value.trim();
  const hasInvalidOptions = localOptions.some(isOptionInvalid);

  const activeOption = localOptions.find(o => o.id === activeId);

  return (
    <Dialog onOpenChange={(open) => { if(!open && !hasInvalidOptions) handleSave() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Field Settings: {field.label || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`req-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: !!checked })}
            />
            <Label htmlFor={`req-${field.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Required Field</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Layout</Label>
            <Select
              value={field.attributes.colSpan?.toString() || "1"}
              onValueChange={(value) => onUpdate({ attributes: { ...field.attributes, colSpan: parseInt(value) as 1 | 2 | 3 | 4 } })}
            >
              <SelectTrigger className="w-full bg-slate-50/50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Column (1/4)</SelectItem>
                <SelectItem value="2">2 Columns (Half)</SelectItem>
                <SelectItem value="3">3 Columns (3/4)</SelectItem>
                <SelectItem value="4">4 Columns (Full)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {field.type === "text" && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Max Length</Label>
              <Input
                type="number"
                value={field.attributes.maxLength || ""}
                className="bg-slate-50/50 border-slate-200"
                onChange={(e) => onUpdate({ attributes: { ...field.attributes, maxLength: parseInt(e.target.value) || undefined } })}
              />
            </div>
          )}

          {field.type === "dropdown" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Options (Label:Value)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Plus className="mr-1 h-3 w-3" /> Add Option
                </Button>
              </div>

              <DndContext
                id="options-dnd"
                sensors={sensors}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleOptionsDragEnd}
                onDragCancel={() => setActiveId(null)}
              >
                <SortableContext items={localOptions.map(o => o.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                    {localOptions.map((option) => (
                      <SortableOption
                        key={option.id}
                        option={option}
                        onUpdate={(updates) => updateOption(option.id, updates)}
                        onRemove={() => removeOption(option.id)}
                        isInvalid={isOptionInvalid(option)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay
                  modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: {
                        active: {
                          opacity: '0.4',
                        },
                      },
                    }),
                  }}
                >
                  {activeOption ? (
                    <div className="bg-white border border-slate-200 rounded-md shadow-xl p-3 flex items-center gap-2 w-[calc(448px-48px)] max-w-full pointer-events-none">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="h-9 px-3 flex items-center text-xs bg-slate-50 border rounded-md truncate">
                          {activeOption.label || "Label"}
                        </div>
                        <div className="h-9 px-3 flex items-center text-xs bg-slate-50 border rounded-md truncate">
                          {activeOption.value || "Value"}
                        </div>
                      </div>
                      <div className="w-8" />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {localOptions.length === 0 && (
                <div className="text-center py-4 border border-dashed rounded-md text-[10px] text-slate-400">
                  No options added.
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Placeholder</Label>
            <Input
              value={field.attributes.placeholder || ""}
              className="bg-slate-50/50 border-slate-200"
              placeholder="e.g. Select an option..."
              onChange={(e) => onUpdate({ attributes: { ...field.attributes, placeholder: e.target.value } })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (hasInvalidOptions) {
                alert("Please fix invalid options before closing.");
                return;
              }
              handleSave();
            }}
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableOption({
  option,
  onUpdate,
  onRemove,
  isInvalid
}: {
  option: CaseFieldOption,
  onUpdate: (updates: Partial<CaseFieldOption>) => void,
  onRemove: () => void,
  isInvalid: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 p-1">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        <Input
          placeholder="Label"
          value={option.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className={cn("h-9 text-xs bg-white", isInvalid && !option.label.trim() && "border-destructive focus-visible:ring-destructive")}
        />
        <Input
          placeholder="Value"
          value={option.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className={cn("h-9 text-xs bg-white", isInvalid && !option.value.trim() && "border-destructive focus-visible:ring-destructive")}
        />
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/5">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
