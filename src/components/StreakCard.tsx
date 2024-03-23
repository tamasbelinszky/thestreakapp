"use client";

import { useConfetti } from "@/hooks/useConfetti";
import { completeStreakById, deleteStreakById } from "@/lib/streak";
import clsx from "clsx";
import { format } from "date-fns";
import { DeleteIcon, EditIcon, LucideRefreshCwOff, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface StreakCardProps {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  period: string;
  streak: number;
  isCompleted: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  id,
  name,
  description,
  startDate,
  period,
  streak,
  isCompleted,
}) => {
  // TODO: add toast for error / success messages
  const [isPending, startTransition] = useTransition();
  const { confetti } = useConfetti();

  const formattedDate = format(startDate, "yyyy.MM.dd");
  const router = useRouter();

  return (
    <div
      className={clsx("flex flex-col gap-4 rounded-lg border-2 p-4 shadow-xl lg:p-8", {
        "border-black bg-foreground text-background dark:bg-background dark:text-foreground": isCompleted,
        "bg-white text-gray-600": !isCompleted,
      })}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {" "}
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="flex-grow">{description}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              // className={cn("hover:border-1", {
              //   "bg-foreground text-background  dark:bg-background dark:text-foreground": isCompleted,
              // })}
              variant={isCompleted ? "default" : "secondary"}
              type="button"
            >
              <svg
                className=" h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <Link
              href={`/chat/${id}`}
              className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-200 active:bg-gray-300"
            >
              <MessageCircleIcon />
              <span className="text-sm font-medium">Chat</span>
            </Link>
            <Link
              href={`/streak/${id}`}
              className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-200 active:bg-gray-300"
            >
              <EditIcon />
              <span className="text-sm font-medium">Edit</span>
            </Link>
            <button
              disabled={isPending}
              onClick={async () => {
                startTransition(async () => {
                  await fetch(`api/chat/${id}`, {
                    method: "DELETE",
                  });
                  router.refresh();
                });
              }}
              className={
                "flex w-full items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              <LucideRefreshCwOff />
              <span className="text-sm font-medium">Reset Chat</span>
            </button>
            <button
              disabled={isPending}
              onClick={async () => {
                startTransition(async () => {
                  await deleteStreakById(id);
                  router.refresh();
                });
              }}
              className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DeleteIcon />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm">Started on: {formattedDate}</span>

        <span className="text-sm">
          {period.charAt(0).toUpperCase() + period.slice(1)} Streak: {streak}
        </span>
      </div>
      <Button
        disabled={isPending}
        variant={isCompleted ? "default" : "secondary"}
        onClick={async () => {
          if (isCompleted) {
            return confetti();
          }
          startTransition(async () => {
            await completeStreakById(id);
            router.refresh();
          });
        }}
      >
        {isPending ? "Loading..." : isCompleted ? "Celebrate!" : "Complete"}
      </Button>
    </div>
  );
};
