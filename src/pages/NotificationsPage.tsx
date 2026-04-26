import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications } = trpc.notification.list.useQuery();
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });
  const markAll = trpc.notification.markAllRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });

  return (
    <RetroLayout>
      <div className="retro-card">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold glitter-text">Notifications</div>
          <button onClick={() => markAll.mutate()} className="retro-btn text-xs">
            Mark All Read
          </button>
        </div>
        <div className="space-y-2">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-center justify-between border border-black/20 p-2 text-sm ${
                  n.readAt ? "bg-white/40" : "bg-white/80"
                }`}
              >
                <div>
                  <div className="font-bold">{n.type.replace("_", " ")}</div>
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.readAt && (
                  <button onClick={() => markRead.mutate({ id: n.id })} className="retro-btn text-xs">
                    Mark Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm italic">No notifications.</div>
          )}
        </div>
      </div>
    </RetroLayout>
  );
}
