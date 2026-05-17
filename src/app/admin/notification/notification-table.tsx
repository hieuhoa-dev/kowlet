"use client";

import { Badge } from "@/components/ui/badge";
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
import { approveNotification, rejectNotification } from "@/lib/actions/notification";
import type { Notification } from "@/types/database";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const statusColor: Record<Notification["status"], string> = {
    pending: "bg-warning/20 text-warning border-warning/30",
    approved: "bg-green-500/10 text-green-600 border-green-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface NotificationTableProps {
    initialNotifications: Notification[];
}

export function NotificationTable({ initialNotifications }: NotificationTableProps) {
    const [notifications, setNotifications] =
        useState<Notification[]>(initialNotifications);
    const [selected, setSelected] = useState<Notification | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    // Supabase Realtime subscription
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel("notifications-admin")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notification" },
                (payload) => {
                    setNotifications((prev) => [
                        payload.new as Notification,
                        ...prev,
                    ]);
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "notification" },
                (payload) => {
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === (payload.new as Notification).id
                                ? (payload.new as Notification)
                                : n
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleApprove = async (id: string) => {
        setLoading(id + "-approve");
        await approveNotification(id);
        setLoading(null);
        setSelected(null);
    };

    const handleReject = async (id: string) => {
        setLoading(id + "-reject");
        await rejectNotification(id);
        setLoading(null);
        setSelected(null);
    };

    return (
        <>
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
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No notifications yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {notifications.map((n) => (
                            <TableRow
                                key={n.id}
                                className="cursor-pointer"
                                onClick={() => setSelected(n)}
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
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                    {n.github_url
                                        ? n.github_url.replace("https://github.com/", "")
                                        : "—"}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[n.status]}`}
                                    >
                                        {n.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(n.created_at), {
                                        addSuffix: true,
                                    })}
                                </TableCell>
                                <TableCell>
                                    {n.status === "pending" && (
                                        <div
                                            className="flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-green-600 hover:text-green-600"
                                                disabled={loading !== null}
                                                onClick={() => handleApprove(n.id)}
                                                title="Approve"
                                            >
                                                {loading === n.id + "-approve" ? (
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                disabled={loading !== null}
                                                onClick={() => handleReject(n.id)}
                                                title="Reject"
                                            >
                                                {loading === n.id + "-reject" ? (
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Detail Sheet */}
            <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Contribution Request</SheetTitle>
                        <SheetDescription>
                            Submitted{" "}
                            {selected &&
                                formatDistanceToNow(new Date(selected.created_at), {
                                    addSuffix: true,
                                })}
                        </SheetDescription>
                    </SheetHeader>

                    {selected && (
                        <div className="mt-6 flex flex-col gap-5">
                            <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Status
                                </p>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[selected.status]}`}
                                >
                                    {selected.status}
                                </span>
                            </div>

                            {selected.url && (
                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Website URL
                                    </p>
                                    <a
                                        href={selected.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        {selected.url}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {selected.github_url && (
                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        GitHub Repository
                                    </p>
                                    <a
                                        href={selected.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        {selected.github_url}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {selected.status === "pending" && (
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleApprove(selected.id)}
                                        disabled={loading !== null}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleReject(selected.id)}
                                        disabled={loading !== null}
                                    >
                                        Reject
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
