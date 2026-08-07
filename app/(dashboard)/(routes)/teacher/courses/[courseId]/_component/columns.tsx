"use client";

import Link from "next/link";
import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <div className="flex flex-row">
          <Button
            variant="ghost"
            className="h-8 rounded-lg px-2 text-xs font-extrabold text-[#806b59] hover:bg-[#f7eee4] hover:text-[#5d422e]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>

          {column.getIsSorted() && (
              <Button variant="ghost" className="h-7 w-7 p-0 text-[#a88b72] hover:bg-[#f7eee4] hover:text-[#6f5138]" onClick={() => column.clearSorting()}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
    cell: ({ row }) => <div className="max-w-[420px] truncate font-bold text-[#4d3929]">{String(row.getValue("title") || "Untitled course")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="flex flex-row">
          <Button
            variant="ghost"
            className="h-8 rounded-lg px-2 text-xs font-extrabold text-[#806b59] hover:bg-[#f7eee4] hover:text-[#5d422e]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>

          {column.getIsSorted() && (
            <Button variant="ghost" className="h-7 w-7 p-0 text-[#a88b72] hover:bg-[#f7eee4] hover:text-[#6f5138]" onClick={() => column.clearSorting()}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <div className="flex flex-row">
          <Button
            variant="ghost"
            className="h-8 rounded-lg px-2 text-xs font-extrabold text-[#806b59] hover:bg-[#f7eee4] hover:text-[#5d422e]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Published
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>

          {column.getIsSorted() && (
            <Button variant="ghost" className="h-7 w-7 p-0 text-[#a88b72] hover:bg-[#f7eee4] hover:text-[#6f5138]" onClick={() => column.clearSorting()}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;

      return (
        <Badge className={cn("border-[#ead7c1] bg-[#fbf3e8] text-[#986b3f]", isPublished && "border-[#d7e8d9] bg-[#f1f8f2] text-[#5f8067]")}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-xl p-0 text-[#9d8b7a] hover:bg-[#f7eee4] hover:text-[#6f5138]">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <Link href={`/teacher/courses/${id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
