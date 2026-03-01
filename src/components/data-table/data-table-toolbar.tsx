"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, X } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchQuery?: string
  onSearchChange?: (value: string) => void
  onRefresh?: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchQuery,
  onSearchChange,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-[250px] lg:w-[350px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery ?? ""}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="h-9 pl-9 pr-8"
          />
          {searchQuery && (
             <Button
                variant="ghost"
                onClick={() => onSearchChange?.("")}
                className="absolute right-0 top-0 h-9 w-9 p-0 hover:bg-transparent"
             >
                <X className="h-4 w-4 text-muted-foreground" />
             </Button>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
