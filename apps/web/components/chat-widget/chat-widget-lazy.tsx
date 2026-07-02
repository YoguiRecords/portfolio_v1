"use client";

import dynamic from "next/dynamic";

/**
 * Defers the chat widget bundle: nothing above the fold depends on it, so its
 * JS (chat + booking form) loads after hydration instead of blocking the
 * initial bundle (Lighthouse: unused JavaScript on first paint).
 */
const ChatWidget = dynamic(() => import("./chat-widget").then((m) => m.ChatWidget), {
  ssr: false,
});

export function ChatWidgetLazy(props: {
  enabled?: boolean;
  name?: string;
  avatarUrl?: string | null;
}) {
  return <ChatWidget {...props} />;
}
