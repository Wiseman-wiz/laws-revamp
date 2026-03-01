"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  ColumnOrderState,
  OnChangeFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { useLocalStorage } from "@/hooks/use-local-storage"

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalRecords?: number
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  searchQuery?: string
  onSearchChange?: (value: string) => void
  onRefresh?: () => void
  onRowClick?: (row: TData) => void
  storageKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRecords,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  onRowClick,
  storageKey = "data-table-prefs",
}: DataTableProps<TData, TValue>) {
  const defaultColumnOrder = React.useMemo(() =>
    columns.map((c) => (c.id || (c as { accessorKey?: string }).accessorKey) as string).filter(Boolean),
    [columns]
  )

  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
    `${storageKey}-visibility`,
    {}
  )
  const [columnOrder, setColumnOrder] = useLocalStorage<ColumnOrderState>(
    `${storageKey}-order`,
    defaultColumnOrder
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
      columnOrder,
    },
    pageCount: pageCount ?? -1,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange,
    onPaginationChange,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onSearchChange,
  })

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((prevColumnOrder) => {
        const oldIndex = prevColumnOrder.indexOf(active.id as string)
        const newIndex = prevColumnOrder.indexOf(over.id as string)
        return arrayMove(prevColumnOrder, oldIndex, newIndex)
      })
    }
  }, [setColumnOrder])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
      />
      <div className="rounded-md border bg-background overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? "cursor-pointer" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <DataTablePagination table={table} totalRecords={totalRecords} />
    </div>
  )
}
