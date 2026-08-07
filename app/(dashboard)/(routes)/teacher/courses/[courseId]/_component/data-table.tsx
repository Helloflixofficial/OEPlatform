"use client";
import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  ColumnFiltersState,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ChevronLeft, ChevronRight, PlusCircle, Search } from "lucide-react";
import Link from "next/link";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]"><BookOpen className="h-3.5 w-3.5" /> Teaching workspace</div>
          <h1 className="text-3xl font-black tracking-tight text-[#3f3024] sm:text-4xl">Courses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#887768]">Create, organize, and publish the lessons your students come to learn from.</p>
        </div>
        <div className="rounded-2xl border border-[#eadfd3] bg-white px-4 py-3 text-right shadow-sm"><p className="text-2xl font-black text-[#4d3929]">{data.length}</p><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d8b7a]">{data.length === 1 ? "Course" : "Courses"}</p></div>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-[#eadfd3] bg-white shadow-[0_8px_30px_rgba(113,83,52,0.05)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#f1e9e1] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ae7b4a]" />
            <Input
              placeholder="Search your courses..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="h-11 rounded-xl border-[#e6d9cc] bg-white pl-10 text-sm text-[#4d3929] placeholder:text-[#b5a699] focus-visible:border-[#bd8956] focus-visible:ring-[#d7b28b]/30"
            />
          </div>
          <Link href="/teacher/create">
            <Button className="h-11 w-full rounded-xl bg-[#6f5138] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(111,81,56,0.18)] hover:bg-[#5d422e] sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              New course
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader className="bg-[#fbf8f4]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-[#eadfd3] hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#9d8b7a]">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-[#f1e9e1] hover:bg-[#fffaf4]">
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id} className="px-5 py-4 text-sm text-[#6b5c50]">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            )) : (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={columns.length} className="h-40 text-center"><BookOpen className="mx-auto h-8 w-8 text-[#c9a47e]" /><p className="mt-3 text-sm font-bold text-[#5f4937]">No courses found</p><p className="mt-1 text-xs text-[#a18e7d]">Try a different search or create your first course.</p></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[#e6d9cc] bg-white text-[#806b59] hover:bg-[#fffaf4] hover:text-[#5d422e]"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[#e6d9cc] bg-white text-[#806b59] hover:bg-[#fffaf4] hover:text-[#5d422e]"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
