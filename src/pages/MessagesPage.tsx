import { useParams, Link } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function MessagesPage() {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const partnerIdNum = partnerId ? Number(partnerId) : undefined;
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: conversations } = trpc.message.conversations.useQuery();
  const { data: thread } = trpc.message.thread.useQuery(
    { partnerId: partnerIdNum! },
    { enabled: !!partnerIdNum }
  );

  const sendMsg = trpc.message.send.useMutation({
    onSuccess: () => {
      utils.message.thread.invalidate({ partnerId: partnerIdNum! });
      utils.message.conversations.invalidate();
    },
  });

  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim() || !partnerIdNum) return;
    sendMsg.mutate({ recipientId: partnerIdNum, content: content.trim() });
    setContent("");
  };

  return (
    <RetroLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversation List */}
        <div className="retro-card md:col-span-1">
          <div className="font-bold mb-2 glitter-text">Conversations</div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              conversations.map((msg) => {
                const partner = msg.senderId === user?.id ? msg.recipient : msg.sender;
                return (
                  <Link
                    key={msg.id}
                    to={`/messages/${partner?.id}`}
                    className={`block border border-black/20 p-2 text-sm no-underline ${partnerIdNum === partner?.id ? "bg-white/80" : "bg-white/40"}`}
                  >
                    <div className="font-bold">{partner?.name || "Unknown"}</div>
                    <div className="truncate text-xs">{msg.content}</div>
                  </Link>
                );
              })
            ) : (
              <div className="text-sm italic">No conversations yet.</div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="retro-card md:col-span-2 flex flex-col h-[70vh]">
          {partnerIdNum ? (
            <>
              <div className="font-bold mb-2 glitter-text">
                Chat with{" "}
                <Link to={`/profile/${partnerIdNum}`} className="underline">
                  {thread?.[0]?.senderId === partnerIdNum
                    ? thread[0].sender?.name
                    : thread?.[0]?.recipientId === partnerIdNum
                    ? thread[0].recipient?.name
                    : "User"}
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
                {thread && thread.length > 0 ? (
                  [...thread].reverse().map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`text-sm ${isMe ? "text-right" : "text-left"}`}>
                        <span
                          className={`inline-block px-2 py-1 border border-black/20 ${
                            isMe ? "bg-cyan-100" : "bg-white/80"
                          }`}
                        >
                          {msg.content}
                        </span>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm italic text-center">No messages yet.</div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="retro-input flex-1 px-2 py-1 text-sm"
                  placeholder="Type a message..."
                />
                <button onClick={handleSend} className="retro-btn text-xs">
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm italic">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </RetroLayout>
  );
}
