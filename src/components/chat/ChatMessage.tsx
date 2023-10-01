import { Message } from "ai/react";
import clsx from "clsx";
import React from "react";

const ChatMessage: React.FC<Message> = (message) => {
  const isFromUser = message.role === "user";

  return (
    <div
      className={clsx("flex", {
        "justify-end": isFromUser,
        "justify-start": !isFromUser,
      })}
    >
      <div
        className={clsx("flex rounded-xl p-2", {
          "bg-primary text-white": isFromUser,
          "bg-secondary": !isFromUser,
        })}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
