"use client";

import ChatMessage from "@/components/chat/ChatMessage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, useChat } from "ai/react";
import { SendIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export const Chat = (props: { initialMessages: Message[] }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: props.initialMessages,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="flex w-full flex-col p-2 lg:max-w-4xl lg:p-4">
        <div className="flex-grow">
          <div className="flex h-full w-full flex-col justify-end gap-2 space-y-2 overflow-y-auto">
            {messages
              .filter((e) => e.role !== "system")
              .map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}

            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="">
          <div className="flex flex-col">
            <form
              onSubmit={(data) => {
                console.log("wtf", { data });
                return handleSubmit(data);
              }}
            >
              <div className="flex items-center gap-2 p-2">
                <Input value={input} placeholder="Say something..." onChange={handleInputChange} />
                <Button
                  type="submit"
                  className={"flex gap-2 rounded-lg bg-primary p-2 text-white"}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Send"}
                  <SendIcon />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
