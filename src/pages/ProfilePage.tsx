import { useParams, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const uid = Number(userId);
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tContent, setTContent] = useState("");
  const [sContent, setSContent] = useState("");

  const { data: profile, isLoading } = trpc.profile.getByUserId.useQuery({ userId: uid });
  const { data: friendship } = trpc.friend.status.useQuery(
    { userId: uid },
    { enabled: isAuthenticated && uid !== user?.id }
  );
  const { data: testimonials } = trpc.testimonial.list.useQuery({ profileUserId: uid });
  const { data: scrapbook } = trpc.scrapbook.list.useQuery({ wallUserId: uid });

  const addFriend = trpc.friend.request.useMutation({
    onSuccess: () => {
      utils.friend.status.invalidate({ userId: uid });
      utils.friend.list.invalidate();
    },
  });
  const acceptFriend = trpc.friend.accept.useMutation({
    onSuccess: () => {
      utils.friend.status.invalidate({ userId: uid });
      utils.friend.list.invalidate();
    },
  });
  const removeFriend = trpc.friend.remove.useMutation({
    onSuccess: () => {
      utils.friend.status.invalidate({ userId: uid });
      utils.friend.list.invalidate();
    },
  });
  const sendTestimonial = trpc.testimonial.create.useMutation({
    onSuccess: () => {
      utils.testimonial.list.invalidate({ profileUserId: uid });
      setTContent("");
    },
  });
  const sendScrapbook = trpc.scrapbook.create.useMutation({
    onSuccess: () => {
      utils.scrapbook.list.invalidate({ wallUserId: uid });
      setSContent("");
    },
  });

  useEffect(() => {
    if (profile?.musicUrl && profile.musicAutoplay && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setMusicBlocked(true));
    }
  }, [profile?.musicUrl, profile?.musicAutoplay]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setMusicBlocked(false);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const isOwner = isAuthenticated && user?.id === uid;


  if (isLoading) {
    return (
      <RetroLayout>
        <div className="retro-card text-center">Loading profile...</div>
      </RetroLayout>
    );
  }

  if (!profile) {
    return (
      <RetroLayout>
        <div className="retro-card text-center">Profile not found.</div>
      </RetroLayout>
    );
  }

  const ownerUser = profile.user;

  return (
    <RetroLayout>
      <div className="space-y-4">
        {/* Music Player */}
        {profile.musicUrl && (
          <div className="retro-card flex items-center gap-3">
            <audio ref={audioRef} src={profile.musicUrl} loop />
            <button onClick={toggleMusic} className="retro-btn text-xs">
              {isPlaying ? "Pause Music" : "Play Music"}
            </button>
            <span className="text-xs italic">
              {musicBlocked ? "Click play to start music!" : isPlaying ? "Now playing..." : "Music paused"}
            </span>
          </div>
        )}

        {/* Profile Header */}
        <div className="retro-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {ownerUser?.avatar ? (
                <img src={ownerUser.avatar} alt="avatar" className="h-24 w-24 border-2 border-black bg-white" />
              ) : (
                <div className="h-24 w-24 border-2 border-black bg-white flex items-center justify-center text-3xl font-bold">
                  {ownerUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <div className="glitter-text text-xl">{ownerUser?.name || "Unknown"}</div>
                <div className="text-xs">
                  Views: <strong>{profile.viewCount}</strong> |{" "}
                  {profile.online ? (
                    <span className="text-green-700 font-bold">Online</span>
                  ) : (
                    <span className="text-gray-600">Offline</span>
                  )}
                </div>
                <div className="text-sm italic mt-1">
                  &quot;{profile.status || "No status yet"}&quot;
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isOwner && (
                <Link to="/settings" className="retro-btn text-xs no-underline text-center">
                  Edit Profile
                </Link>
              )}
              {!isOwner && isAuthenticated && (
                <>
                  {!friendship ? (
                    <button onClick={() => addFriend.mutate({ addresseeId: uid })} className="retro-btn text-xs">
                      Add Friend
                    </button>
                  ) : friendship.status === "pending" ? (
                    friendship.requesterId === user?.id ? (
                      <span className="text-xs font-bold">Request Sent</span>
                    ) : (
                      <button
                        onClick={() => acceptFriend.mutate({ friendshipId: friendship.id })}
                        className="retro-btn text-xs"
                      >
                        Accept Friend
                      </button>
                    )
                  ) : (
                    <button onClick={() => removeFriend.mutate({ friendshipId: friendship.id })} className="retro-btn text-xs">
                      Remove Friend
                    </button>
                  )}
                  <Link to={`/messages/${uid}`} className="retro-btn text-xs no-underline text-center">
                    Send Message
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Custom HTML/CSS Layout or Default */}
        {profile.profileHtml ? (
          <div className="retro-card">
            {profile.profileCss && <style>{profile.profileCss}</style>}
            <div dangerouslySetInnerHTML={{ __html: profile.profileHtml }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Bio */}
              <div className="retro-card">
                <div className="font-bold mb-2 glitter-text">About Me</div>
                <div className="text-sm whitespace-pre-wrap">{profile.bio || "No bio yet."}</div>
              </div>

              {/* Interests */}
              <div className="retro-card">
                <div className="font-bold mb-2 glitter-text">Interests</div>
                <div className="text-sm whitespace-pre-wrap">{profile.interests || "No interests listed."}</div>
              </div>

              {/* Favorites */}
              <div className="retro-card">
                <div className="font-bold mb-2 glitter-text">Favorites</div>
                <div className="text-sm whitespace-pre-wrap">{profile.favorites || "No favorites listed."}</div>
              </div>
            </div>

            {/* Center / Right Columns */}
            <div className="md:col-span-2 space-y-4">
              {/* Scrapbook */}
              <div className="retro-card">
                <div className="font-bold mb-2 glitter-text">Scrapbook</div>
                {isAuthenticated && (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={sContent}
                      onChange={(e) => setSContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sContent.trim() && sendScrapbook.mutate({ wallUserId: uid, content: sContent.trim() })}
                      className="retro-input flex-1 px-2 py-1 text-sm"
                      placeholder="Write on the wall..."
                    />
                    <button
                      onClick={() => sContent.trim() && sendScrapbook.mutate({ wallUserId: uid, content: sContent.trim() })}
                      className="retro-btn text-xs"
                    >
                      Post
                    </button>
                  </div>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scrapbook && scrapbook.length > 0 ? (
                    scrapbook.map((post) => (
                      <div key={post.id} className="border border-black/20 p-2 text-sm bg-white/60">
                        <div className="font-bold text-xs">
                          <Link to={`/profile/${post.authorId}`} className="underline">
                            {post.author?.name || "Unknown"}
                          </Link>{" "}
                          <span className="font-normal text-gray-600">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1">{post.content}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm italic">No scrapbook posts yet.</div>
                  )}
                </div>
              </div>

              {/* Testimonials */}
              <div className="retro-card">
                <div className="font-bold mb-2 glitter-text">Testimonials</div>
                {isAuthenticated && (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={tContent}
                      onChange={(e) => setTContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && tContent.trim() && sendTestimonial.mutate({ profileUserId: uid, content: tContent.trim() })}
                      className="retro-input flex-1 px-2 py-1 text-sm"
                      placeholder="Leave a testimonial..."
                    />
                    <button
                      onClick={() => tContent.trim() && sendTestimonial.mutate({ profileUserId: uid, content: tContent.trim() })}
                      className="retro-btn text-xs"
                    >
                      Post
                    </button>
                  </div>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testimonials && testimonials.length > 0 ? (
                    testimonials.map((t) => (
                      <div key={t.id} className="border border-black/20 p-2 text-sm bg-white/60">
                        <div className="font-bold text-xs">
                          <Link to={`/profile/${t.authorId}`} className="underline">
                            {t.author?.name || "Unknown"}
                          </Link>{" "}
                          <span className="font-normal text-gray-600">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 italic">&quot;{t.content}&quot;</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm italic">No testimonials yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RetroLayout>
  );
}
