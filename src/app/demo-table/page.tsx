"use client"

import { useQueryState, parseAsInteger, parseAsString, parseAsJson } from "nuqs"
import { ColumnDef, PaginationState, SortingState, OnChangeFn } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

interface Task {
  id: string
  title: string
  status: string
  priority: string
}

const data: Task[] = [
  { id: "1", title: "Implement table", status: "In Progress", priority: "High" },
  { id: "2", title: "Add drag and drop", status: "Todo", priority: "Medium" },
  { id: "3", title: "Add sorting", status: "Done", priority: "Low" },
  { id: "4", title: "Support nuqs", status: "Todo", priority: "High" },
  { id: "5", title: "Local storage persistence", status: "Done", priority: "Medium" },
  { id: "6", title: "Modular components", status: "In Progress", priority: "Low" },
  { id: "7", title: "Search functionality", status: "Todo", priority: "High" },
  { id: "8", title: "Column visibility", status: "Done", priority: "Medium" },
  { id: "9", title: "Refresh button", status: "Todo", priority: "Low" },
  { id: "10", title: "Dynamic headers", status: "In Progress", priority: "High" },
  { id: "11", title: "Junior dev friendly", status: "Done", priority: "Medium" },
]

export default function DataTableDemo() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
  const [pageIndex, setPageIndex] = useQueryState("page", parseAsInteger.withDefault(0))
  const [pageSize, setPageSize] = useQueryState("size", parseAsInteger.withDefault(10))
  const [sorting, setSorting] = useQueryState<SortingState>(
    "sort",
    parseAsJson<SortingState>((val) => val as SortingState).withDefault([])
  )

  const columns: ColumnDef<Task>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
    },
  ]

  const pagination: PaginationState = {
    pageIndex,
    pageSize,
  }

  const onPaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const nextValue =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue
    setPageIndex(nextValue.pageIndex)
    setPageSize(nextValue.pageSize)
  }

  const onSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const nextValue =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting ?? [])
        : updaterOrValue
    setSorting(nextValue)
  }

  const filteredData = data.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedData = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">DataTable Demo</h1>
      <DataTable
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageCount={Math.ceil(filteredData.length / (pageSize || 10))}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting ?? []}
        onSortingChange={onSortingChange}
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPageIndex(0)
        }}
        onRefresh={() => console.log("Refreshing...")}
        onRowClick={(row) => alert(`Clicked row: ${row.title}`)}
        storageKey="demo-table"
      />
    </div>
  )
}
