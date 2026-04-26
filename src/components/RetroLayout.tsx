import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export default function RetroLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { data: profile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const [theme, setTheme] = useState("default");
  const [cursor, setCursor] = useState("auto");
  const [bg, setBg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (profile) {
      setTheme(profile.theme || "default");
      setCursor(profile.cursorStyle || "auto");
      setBg(profile.backgroundUrl || undefined);
    }
  }, [profile]);

  useEffect(() => {
    document.body.className = document.body.className.replace(/theme-\S+/g, "");
    if (theme && theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  useEffect(() => {
    if (cursor && cursor !== "auto") {
      document.body.style.cursor = `url(${cursor}), auto`;
    } else {
      document.body.style.cursor = "auto";
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [cursor]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundColor: bg ? undefined : "var(--retro-bg)",
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
        color: "var(--retro-fg)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-4">
        {/* Header */}
        <div className="retro-card mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="glitter-text text-2xl no-underline">
            KAP-Friendster
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link to="/" className={`retro-btn text-sm no-underline ${isActive("/") ? "opacity-70" : ""}`}>
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/friends" className={`retro-btn text-sm no-underline ${isActive("/friends") ? "opacity-70" : ""}`}>
                  Friends
                </Link>
                <Link to="/messages" className={`retro-btn text-sm no-underline ${isActive("/messages") ? "opacity-70" : ""}`}>
                  Messages
                </Link>
                <Link to="/notifications" className={`retro-btn text-sm no-underline ${isActive("/notifications") ? "opacity-70" : ""}`}>
                  Notifys
                </Link>
                <Link to="/search" className={`retro-btn text-sm no-underline ${isActive("/search") ? "opacity-70" : ""}`}>
                  Search
                </Link>
                <Link to="/settings" className={`retro-btn text-sm no-underline ${isActive("/settings") ? "opacity-70" : ""}`}>
                  Settings
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className={`retro-btn text-sm no-underline ${isActive("/admin") ? "opacity-70" : ""}`}>
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="retro-btn text-sm">
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="retro-btn text-sm no-underline">
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* User info bar */}
        {isAuthenticated && user && (
          <div className="retro-card mb-4 flex items-center gap-3 text-sm">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-10 w-10 border-2 border-black" />
            ) : (
              <div className="h-10 w-10 border-2 border-black bg-white flex items-center justify-center font-bold">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
              <div className="font-bold">{user.name || "User"}</div>
              <div className="text-xs opacity-80">{user.email}</div>
            </div>
            <div className="ml-auto text-xs italic">
              {profile?.online ? "Online" : "Offline"}
            </div>
          </div>
        )}

        <main>{children}</main>

        {/* Footer */}
        <div className="retro-card mt-4 text-center text-xs">
          <div className="marquee">
            <span>
              Welcome to KAP-Friendster :: Built with love :: 2000s nostalgia :: Add friends :: Leave testimonials :: Customize your profile ::
            </span>
          </div>
          <div className="mt-2">&copy; {new Date().getFullYear()} KAP-Friendster. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
