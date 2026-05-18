import { getAdminNotifications } from "@/lib/actions/notification";
import { getAllTags } from "@/lib/actions/tags";
import { NotificationTable } from "./notification-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default async function AdminNotificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as StatusFilter;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));

  const [{ notifications, total }, tags] = await Promise.all([
    getAdminNotifications({ status, page, limit: PAGE_SIZE }),
    getAllTags(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>
      <NotificationTable
        initialNotifications={notifications}
        tags={tags}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        currentStatus={status}
      />
    </div>
  );
}
