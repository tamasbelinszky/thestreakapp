import { Message } from "ai/react";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage: React.FC<PropsWithChildren<Message>> = (props) => {
  const isFromUser = props.role === "user";

  return (
    <div
      className={clsx("flex w-full", {
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
        <div>
          <ReactMarkdown
            components={{
              th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                <th className={"text-red break-words border border-black bg-gray-500 px-3 py-1 "} {...props}>
                  {children}
                </th>
              ),
              p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
                <p className={"mb-2 whitespace-pre-line break-words last:mb-0"} {...props}>
                  {children}
                </p>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {props.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
