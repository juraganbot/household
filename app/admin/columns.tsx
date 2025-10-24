"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Key, Trash2, Edit2, Copy, Check, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ProtectedEmail = {
  _id: string
  email: string
  accessKey: string
  createdAt: string
  isLocked: boolean
}

export const createColumns = (
  onToggleLock: (id: string) => void,
  onDelete: (id: string) => void,
  onViewKey: (id: string) => void,
  onCopyKey: (key: string) => void,
  copiedKey: string | null
): ColumnDef<ProtectedEmail>[] => [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${row.original.isLocked ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
            {row.original.isLocked ? (
              <Lock className="size-4 text-red-600 dark:text-red-500" />
            ) : (
              <Unlock className="size-4 text-green-600 dark:text-green-500" />
            )}
          </div>
          <div>
            <p className="font-medium">{row.getValue("email")}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(row.original.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "accessKey",
    header: "Access Key",
    cell: ({ row }) => {
      const key = row.getValue("accessKey") as string
      return (
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
            {key.substring(0, 20)}...
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopyKey(key)}
            className="h-8 w-8 p-0"
          >
            {copiedKey === key ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "isLocked",
    header: "Status",
    cell: ({ row }) => {
      const isLocked = row.getValue("isLocked") as boolean
      return (
        <Badge variant={isLocked ? "destructive" : "default"}>
          {isLocked ? "Locked" : "Unlocked"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const email = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Key className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewKey(email._id)}>
              <Key className="mr-2 h-4 w-4" />
              View Full Key
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyKey(email.accessKey)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleLock(email._id)}>
              {email.isLocked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(email._id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
