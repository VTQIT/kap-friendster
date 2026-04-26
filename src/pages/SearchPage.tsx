import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = trpc.profile.search.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  return (
    <RetroLayout>
      <div className="retro-card">
        <div className="font-bold mb-3 glitter-text">Search Users</div>
        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter"}
            className="retro-input flex-1 px-2 py-1 text-sm"
            placeholder="Search by name or email..."
          />
        </div>
        {isLoading && <div className="text-sm">Searching...</div>}
        <div className="space-y-2">
          {results && results.length > 0 ? (
            results.map((u) => (
              <div key={u.id} className="flex items-center justify-between border border-black/20 p-2 bg-white/60">
                <div className="flex items-center gap-2">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="h-8 w-8 border border-black" />
                  ) : (
                    <div className="h-8 w-8 border border-black bg-white flex items-center justify-center text-xs font-bold">
                      {u.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <Link to={`/profile/${u.id}`} className="text-sm font-bold underline">
                      {u.name || "Unknown"}
                    </Link>
                    <div className="text-xs">{u.email}</div>
                  </div>
                </div>
                <Link to={`/profile/${u.id}`} className="retro-btn text-xs no-underline">
                  View Profile
                </Link>
              </div>
            ))
          ) : query.length > 0 && !isLoading ? (
            <div className="text-sm italic">No users found.</div>
          ) : null}
        </div>
      </div>
    </RetroLayout>
  );
}
