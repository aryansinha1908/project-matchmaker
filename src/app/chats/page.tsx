"use client";

import { useEffect, useState, useRef } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Send,
  MessageSquare,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Conversation = {
  _id: string;
  participants: {
    _id: string;
    githubUsername: string;
    avatar: string;
    email: string;
  }[];
  lastMessage: string;
  updatedAt: string;
  isGroupChat?: boolean;
  groupName?: string;
  projectId?: { _id: string; title: string };
};

type Message = {
  _id: string;
  sender: {
    _id: string;
    githubUsername: string;
    avatar: string;
    email: string;
  };
  text: string;
  createdAt: string;
};

export default function ChatsPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const json = await res.json();
          setConversations(json.conversations || []);
        }
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoadingChats(false);
      }
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chats/${selectedChat?._id}/messages`);
        if (res.ok) {
          const json = await res.json();
          setMessages(json.messages || []);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const tempText = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`/api/chats/${selectedChat._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tempText }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [...prev, json.message]);

        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedChat._id ? { ...c, lastMessage: tempText } : c,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const getChatDetails = (chat: Conversation) => {
    if (chat.isGroupChat) {
      return {
        name: chat.groupName || "Team Chat",
        avatar: undefined,
        isGroup: true,
        subtitle: "Team Chat", // <--- Badge text
      };
    }

    const otherUser =
      chat.participants.find((p) => p.email !== session?.user?.email) ||
      chat.participants[0];
    return {
      name: `@${otherUser?.githubUsername || "Unknown"}`,
      avatar: otherUser?.avatar,
      isGroup: false,
      // <--- Display the project title if it exists, otherwise "Direct Message"
      subtitle: chat.projectId
        ? `Re: ${chat.projectId.title}`
        : "Direct Message",
    };
  };

  if (loadingChats) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 size={32} className="animate-spin text-[#d8b4fe]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 h-[85vh] min-h-[600px] max-h-[900px] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ROCK-SOLID LAYOUT: Always visible side-by-side */}
      <div className="flex h-full w-full gap-6 overflow-hidden relative z-10">
        {/* LEFT SIDEBAR: Locked to exactly 320px wide */}
        <Card className="w-[320px] shrink-0 border-white/5 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
              <MessageSquare size={20} className="text-[#d8b4fe]" /> Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map((chat) => {
              const details = getChatDetails(chat);
              const isSelected = selectedChat?._id === chat._id;

              return (
                <li
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/5 ${isSelected ? "bg-white/10 border-l-2 border-[#d8b4fe]" : "border-l-2 border-transparent"}`}
                >
                  <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                    <AvatarImage src={details.avatar} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-300 flex items-center justify-center">
                      {details.isGroup ? (
                        <Users size={16} />
                      ) : (
                        details.name.replace("@", "")[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-200 truncate">
                        {details.name}
                      </p>
                      <span className="text-[9px] shrink-0 text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 truncate max-w-[90px]">
                        {details.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {chat.lastMessage || "Start a conversation..."}
                    </p>
                  </div>
                </li>
              );
            })}
          </div>
        </Card>

        {/* RIGHT AREA: CHAT WINDOW aggressively fills remaining space */}
        <Card className="flex-1 flex flex-col min-h-0 border-white/5 bg-black/20 backdrop-blur-md overflow-hidden shadow-xl relative">
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <MessageSquare size={32} className="text-zinc-600" />
              </div>
              <p>Select a conversation from the sidebar to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 z-20">
                <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                  <AvatarImage src={getChatDetails(selectedChat).avatar} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    {getChatDetails(selectedChat).isGroup ? (
                      <Users size={14} />
                    ) : (
                      getChatDetails(selectedChat)
                        .name.replace("@", "")[0]
                        ?.toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-zinc-100">
                    {getChatDetails(selectedChat).name}
                  </h3>
                  {selectedChat.isGroupChat && (
                    <p className="text-[10px] text-zinc-500">
                      {selectedChat.participants.length} members
                    </p>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 custom-scrollbar z-10">
                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader2
                      size={24}
                      className="animate-spin text-[#d8b4fe]"
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?.email === session?.user?.email;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? "bg-gradient-to-br from-[#c084fc] to-[#d8b4fe] text-black rounded-tr-sm"
                              : "bg-white/10 border border-white/5 text-zinc-200 rounded-tl-sm"
                          }`}
                        >
                          <p className="break-words">{msg.text}</p>
                          <span
                            className={`text-[10px] mt-1 block ${isMe ? "text-purple-950/70 text-right" : "text-zinc-500"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Strict z-50 to ensure clickability */}
              <div className="p-4 border-t border-white/5 bg-[#0d0d12] relative z-50">
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 w-full"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]/50 text-zinc-200 rounded-lg px-4 py-2.5 transition-all relative z-50"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#d8b4fe] hover:bg-[#c084fc] text-black shrink-0 h-auto py-2.5 px-5 relative z-50"
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
