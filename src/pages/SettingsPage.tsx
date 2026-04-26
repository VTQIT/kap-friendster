import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: profile } = trpc.profile.me.useQuery();
  const update = trpc.profile.update.useMutation({
    onSuccess: () => utils.profile.me.invalidate(),
  });

  const [form, setForm] = useState({
    bio: profile?.bio || "",
    interests: profile?.interests || "",
    favorites: profile?.favorites || "",
    status: profile?.status || "",
    profileHtml: profile?.profileHtml || "",
    profileCss: profile?.profileCss || "",
    cursorStyle: profile?.cursorStyle || "",
    theme: profile?.theme || "default",
    musicUrl: profile?.musicUrl || "",
    musicAutoplay: profile?.musicAutoplay ?? true,
  });

  const [bgFile, setBgFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();
    return json.url;
  };

  const handleSave = async () => {
    setUploading(true);
    let backgroundUrl = profile?.backgroundUrl;
    let musicUrl = profile?.musicUrl;
    try {
      if (bgFile) backgroundUrl = await uploadFile(bgFile);
      if (musicFile) musicUrl = await uploadFile(musicFile);
    } catch {
      alert("Upload failed");
      setUploading(false);
      return;
    }
    update.mutate({
      bio: form.bio,
      interests: form.interests,
      favorites: form.favorites,
      status: form.status,
      profileHtml: form.profileHtml,
      profileCss: form.profileCss,
      cursorStyle: form.cursorStyle,
      theme: form.theme,
      musicUrl: musicUrl || form.musicUrl || undefined,
      musicAutoplay: form.musicAutoplay,
      backgroundUrl: backgroundUrl || undefined,
    });
    setUploading(false);
    setBgFile(null);
    setMusicFile(null);
  };

  return (
    <RetroLayout>
      <div className="space-y-4">
        <div className="retro-card">
          <div className="font-bold mb-3 glitter-text">Edit Profile</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <label className="font-bold block">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="retro-input w-full h-20 px-2 py-1"
              />
              <label className="font-bold block">Interests</label>
              <textarea
                value={form.interests}
                onChange={(e) => handleChange("interests", e.target.value)}
                className="retro-input w-full h-20 px-2 py-1"
              />
              <label className="font-bold block">Favorites</label>
              <textarea
                value={form.favorites}
                onChange={(e) => handleChange("favorites", e.target.value)}
                className="retro-input w-full h-20 px-2 py-1"
              />
              <label className="font-bold block">Status</label>
              <input
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="retro-input w-full px-2 py-1"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold block">Theme</label>
              <select
                value={form.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="retro-input w-full px-2 py-1"
              >
                <option value="default">Default (2000s)</option>
                <option value="cyber">Cyber</option>
                <option value="pink">Pink</option>
                <option value="dark">Dark</option>
              </select>
              <label className="font-bold block">Cursor URL (optional)</label>
              <input
                value={form.cursorStyle}
                onChange={(e) => handleChange("cursorStyle", e.target.value)}
                className="retro-input w-full px-2 py-1"
                placeholder="https://example.com/cursor.png"
              />
              <label className="font-bold block">Background Image</label>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setBgFile(e.target.files?.[0] || null)}
                className="retro-input w-full text-xs"
              />
              {profile?.backgroundUrl && (
                <div className="text-xs">Current: {profile.backgroundUrl}</div>
              )}
              <label className="font-bold block">Music URL or Upload MP3</label>
              <input
                value={form.musicUrl}
                onChange={(e) => handleChange("musicUrl", e.target.value)}
                className="retro-input w-full px-2 py-1 mb-1"
                placeholder="https://example.com/song.mp3"
              />
              <input
                ref={musicInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3"
                onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                className="retro-input w-full text-xs"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.musicAutoplay}
                  onChange={(e) => handleChange("musicAutoplay", e.target.checked)}
                />
                Autoplay music on profile
              </label>
            </div>
          </div>
        </div>

        <div className="retro-card">
          <div className="font-bold mb-2 glitter-text">Custom Layout (HTML/CSS)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-bold block">Custom CSS</label>
              <textarea
                value={form.profileCss}
                onChange={(e) => handleChange("profileCss", e.target.value)}
                className="retro-input w-full h-32 px-2 py-1 font-mono text-xs"
                placeholder="/* your custom CSS */"
              />
            </div>
            <div>
              <label className="font-bold block">Custom HTML</label>
              <textarea
                value={form.profileHtml}
                onChange={(e) => handleChange("profileHtml", e.target.value)}
                className="retro-input w-full h-32 px-2 py-1 font-mono text-xs"
                placeholder="<div>Your custom HTML</div>"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-700">
            Warning: custom HTML/CSS is rendered directly. Use with care!
          </div>
        </div>

        <div className="text-right">
          <button onClick={handleSave} disabled={uploading} className="retro-btn text-sm">
            {uploading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </RetroLayout>
  );
}
