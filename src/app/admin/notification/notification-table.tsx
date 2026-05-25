"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import {
  approveNotification,
  rejectNotification,
} from "@/lib/actions/notification";
import type { Notification } from "@/types/database";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusColor: Record<Notification["status"], string> = {
  pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface NotificationTableProps {
  initialNotifications: Notification[];
  tags: { id: string; name: string }[];
  total: number;
  page: number;
  pageSize: number;
  currentStatus: StatusFilter;
}

export function NotificationTable({
  initialNotifications,
  tags,
  total,
  page,
  pageSize,
  currentStatus,
}: NotificationTableProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [loading, setLoading]   = useState<string | null>(null);

  // Tags selected by admin in approve sheet
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const totalPages = Math.ceil(total / pageSize);

  // Sync server data to local state on refresh
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // ─── Supabase Realtime ────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel("notifications-admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notification" },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notification" },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === (payload.new as Notification).id
                ? (payload.new as Notification)
                : n,
            ),
          );
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Tab / pagination navigation ─────────────────────────────
  const goStatus = (status: StatusFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    status === "all" ? params.delete("status") : params.set("status", status);
    params.delete("page");
    router.replace(`/admin/notification?${params.toString()}`);
  };

  const goPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    p > 0 ? params.set("page", String(p)) : params.delete("page");
    router.replace(`/admin/notification?${params.toString()}`);
  };

  // ─── Actions ──────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      setLoading(id + "-approve");
      await approveNotification(id, selectedTagIds);
    } catch (e) {
      console.error("Error approving:", e);
      alert(e instanceof Error ? e.message : "Error approving notification");
    } finally {
      setLoading(null);
      setSelected(null);
      setSelectedTagIds([]);
      // The server action now calls revalidatePath, so router.refresh() is redundant 
      // but keeping it doesn't hurt. Next.js will automatically refresh.
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(id + "-reject");
      await rejectNotification(id);
    } catch (e) {
      console.error("Error rejecting:", e);
      alert(e instanceof Error ? e.message : "Error rejecting notification");
    } finally {
      setLoading(null);
      setSelected(null);
    }
  };

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );

  const openSheet = (n: Notification) => {
    setSelected(n);
    setSelectedTagIds([]);
  };

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => goStatus(tab.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              currentStatus === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Website URL</TableHead>
              <TableHead>GitHub URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No notifications.
                </TableCell>
              </TableRow>
            )}
            {notifications.map((n) => (
              <TableRow
                key={n.id}
                className="cursor-pointer"
                onClick={() => openSheet(n)}
              >
                <TableCell className="max-w-[200px] truncate text-sm">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {new URL(n.url).hostname}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : "—"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {n.github_url
                    ? n.github_url.replace("https://github.com/", "")
                    : "—"}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[n.status]}`}>
                    {n.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {n.status === "pending" && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-green-600 hover:text-green-600"
                        disabled={loading !== null}
                        onClick={() => handleApprove(n.id)}
                        title="Approve"
                      >
                        {loading === n.id + "-approve"
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        disabled={loading !== null}
                        onClick={() => handleReject(n.id)}
                        title="Reject"
                      >
                        {loading === n.id + "-reject"
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          : <XCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {totalPages} — {total} total</span>
          <div className="flex gap-1">
            <Button
              variant="outline" size="icon" className="h-8 w-8"
              disabled={page === 0}
              onClick={() => goPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="icon" className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => goPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail + Approve Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex flex-col gap-0 overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Contribution Request</SheetTitle>
            <SheetDescription>
              Submitted{" "}
              {selected &&
                formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="flex flex-col gap-5 pt-2 px-4">
              {/* Status */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              {/* Website URL */}
              {selected.url && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Website URL
                  </p>
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {selected.url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* GitHub URL */}
              {selected.github_url && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    GitHub Repository
                  </p>
                  <a
                    href={selected.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {selected.github_url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Tag picker — chỉ hiện khi pending */}
              {selected.status === "pending" && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assign Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5 rounded-md border border-border p-2.5 max-h-48 overflow-y-auto">
                    {tags.map((tag) => {
                      const active = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-accent"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                    {tags.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No tags yet — run seed_tags.sql first.
                      </span>
                    )}
                  </div>
                  {selectedTagIds.length > 0 && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {selectedTagIds.length} tag{selectedTagIds.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}

              {/* Approve / Reject buttons */}
              {selected.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(selected.id)}
                    disabled={loading !== null}
                  >
                    {loading === selected.id + "-approve"
                      ? "Approving..."
                      : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selected.id)}
                    disabled={loading !== null}
                  >
                    {loading === selected.id + "-reject"
                      ? "Rejecting..."
                      : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
