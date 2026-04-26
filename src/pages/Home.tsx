import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: myProfile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const { data: friends } = trpc.friend.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.notification.list.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => utils.profile.me.invalidate(),
  });

  const [status, setStatus] = useState("");

  const handleStatusUpdate = () => {
    if (!status.trim()) return;
    updateProfile.mutate({ status: status.trim() });
    setStatus("");
  };

  const unreadCount = notifications?.filter((n) => !n.readAt).length ?? 0;

  return (
    <RetroLayout>
      <div className="space-y-4">
        {/* Status Update */}
        {isAuthenticated && (
          <div className="retro-card">
            <div className="font-bold mb-2 glitter-text">What&apos;s on your mind?</div>
            <div className="flex gap-2">
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStatusUpdate()}
                className="retro-input flex-1 px-2 py-1 text-sm"
                placeholder="Update your status..."
              />
              <button onClick={handleStatusUpdate} className="retro-btn text-sm">
                Update
              </button>
            </div>
            {myProfile?.status && (
              <div className="mt-2 text-sm italic border-t border-black/20 pt-2">
                Current status: &quot;{myProfile.status}&quot;
              </div>
            )}
          </div>
        )}

        {/* Welcome for guests */}
        {!isAuthenticated && (
          <div className="retro-card text-center">
            <div className="glitter-text text-xl mb-2">Welcome to KAP-Friendster!</div>
            <p className="text-sm mb-3">
              The most nostalgic social network on the web. Sign in to customize your profile, add friends, and share testimonials.
            </p>
            <Link to="/login" className="retro-btn no-underline inline-block">
              Sign In with Kimi
            </Link>
          </div>
        )}

        {/* Dashboard Grid */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Card */}
            <div className="retro-card md:col-span-2">
              <div className="font-bold mb-2 glitter-text">My Profile</div>
              <div className="flex items-start gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt="me" className="h-20 w-20 border-2 border-black" />
                ) : (
                  <div className="h-20 w-20 border-2 border-black bg-white flex items-center justify-center text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className="text-sm space-y-1">
                  <div className="font-bold">{user?.name}</div>
                  <div className="italic">{myProfile?.bio || "No bio yet..."}</div>
                  <div className="text-xs">
                    Views: <strong>{myProfile?.viewCount ?? 0}</strong>
                  </div>
                  <Link to={`/profile/${user?.id}`} className="retro-btn text-xs no-underline inline-block mt-1">
                    View My Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Notifications Summary */}
              <div className="retro-card">
                <div className="font-bold mb-2">Notifications</div>
                <div className="text-sm">
                  You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? "s" : ""}
                </div>
                <Link to="/notifications" className="retro-btn text-xs no-underline inline-block mt-2">
                  View All
                </Link>
              </div>

              {/* Friends Summary */}
              <div className="retro-card">
                <div className="font-bold mb-2">Friends</div>
                <div className="text-sm">
                  <strong>{friends?.length ?? 0}</strong> friend{(friends?.length ?? 0) !== 1 ? "s" : ""}
                </div>
                <Link to="/friends" className="retro-btn text-xs no-underline inline-block mt-2">
                  Manage Friends
                </Link>
              </div>

              {/* Quick Links */}
              <div className="retro-card">
                <div className="font-bold mb-2">Quick Links</div>
                <div className="flex flex-col gap-1">
                  <Link to="/search" className="text-sm underline">
                    Search Users
                  </Link>
                  <Link to="/messages" className="text-sm underline">
                    Messages
                  </Link>
                  <Link to="/settings" className="text-sm underline">
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RetroLayout>
  );
}
