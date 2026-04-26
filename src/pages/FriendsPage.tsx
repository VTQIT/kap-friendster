import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function FriendsPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: friends } = trpc.friend.list.useQuery();
  const { data: pending } = trpc.friend.pending.useQuery();
  const { data: sent } = trpc.friend.sent.useQuery();

  const accept = trpc.friend.accept.useMutation({
    onSuccess: () => {
      utils.friend.pending.invalidate();
      utils.friend.list.invalidate();
    },
  });
  const remove = trpc.friend.remove.useMutation({
    onSuccess: () => {
      utils.friend.list.invalidate();
      utils.friend.pending.invalidate();
      utils.friend.sent.invalidate();
    },
  });

  return (
    <RetroLayout>
      <div className="space-y-4">
        {/* Pending Requests */}
        {pending && pending.length > 0 && (
          <div className="retro-card">
            <div className="font-bold mb-3 glitter-text">Friend Requests</div>
            <div className="space-y-2">
              {pending.map((req) => (
                <div key={req.id} className="flex items-center justify-between border border-black/20 p-2 bg-white/60">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 border border-black bg-white flex items-center justify-center text-xs font-bold">
                      {req.requester?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <Link to={`/profile/${req.requesterId}`} className="text-sm font-bold underline">
                      {req.requester?.name || "Unknown"}
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => accept.mutate({ friendshipId: req.id })} className="retro-btn text-xs">
                      Accept
                    </button>
                    <button onClick={() => remove.mutate({ friendshipId: req.id })} className="retro-btn text-xs">
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests */}
        {sent && sent.length > 0 && (
          <div className="retro-card">
            <div className="font-bold mb-3 glitter-text">Sent Requests</div>
            <div className="space-y-2">
              {sent.map((req) => (
                <div key={req.id} className="flex items-center justify-between border border-black/20 p-2 bg-white/60">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 border border-black bg-white flex items-center justify-center text-xs font-bold">
                      {req.addressee?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <Link to={`/profile/${req.addresseeId}`} className="text-sm font-bold underline">
                      {req.addressee?.name || "Unknown"}
                    </Link>
                  </div>
                  <span className="text-xs italic">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="retro-card">
          <div className="font-bold mb-3 glitter-text">My Friends</div>
          {friends && friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {friends.map((f) => {
                const partner = f.requesterId === user?.id ? f.addressee : f.requester;
                return (
                  <div key={f.id} className="flex items-center justify-between border border-black/20 p-2 bg-white/60">
                    <div className="flex items-center gap-2">
                      {partner?.avatar ? (
                        <img src={partner.avatar} alt="" className="h-8 w-8 border border-black" />
                      ) : (
                        <div className="h-8 w-8 border border-black bg-white flex items-center justify-center text-xs font-bold">
                          {partner?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <Link to={`/profile/${partner?.id}`} className="text-sm font-bold underline">
                        {partner?.name || "Unknown"}
                      </Link>
                    </div>
                    <button onClick={() => remove.mutate({ friendshipId: f.id })} className="retro-btn text-xs">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm italic">No friends yet. Go search for some!</div>
          )}
        </div>
      </div>
    </RetroLayout>
  );
}
