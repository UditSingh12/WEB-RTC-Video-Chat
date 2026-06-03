"use client";

import { FormEvent, useState } from "react";

export type ChatMessage = {
  sender: string;
  message: string;
  timestamp: number;
};

type Props = {
  messages: ChatMessage[];
  onSend: (message: string) => void;
};

export default function ChatPanel({
  messages,
  onSend
}: Props) {
  const [text, setText] =
    useState("");

  const submit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!text.trim()) return;

    onSend(text);

    setText("");
  };

  return (
    <div className="flex flex-col h-full border-l border-slate-700">
      <div
        data-test-id="chat-log"
        className="flex-1 overflow-auto p-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            data-test-id="chat-message"
            className="mb-2"
          >
            <strong>
              {msg.sender}
            </strong>
            : {msg.message}
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="p-4 flex gap-2"
      >
        <input
          data-test-id="chat-input"
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
          className="flex-1 px-3 py-2 text-black rounded"
          placeholder="Message..."
        />

        <button
          data-test-id="chat-submit"
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}