"use client";

import { completeStreakById, deleteStreakById } from "@/lib/streak";
import { format } from "date-fns";
import { DeleteIcon, EditIcon, ShareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface StreakCardProps {
  id: string;
  name?: string;
  description: string;
  startDate: Date;
  period: string;
  streak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  id,
  name = "LinkedIn Post",
  description,
  startDate,
  period,
  streak,
}) => {
  const [isPending, startTransition] = useTransition();

  const formattedDate = format(startDate, "yyyy.MM.dd");
  const router = useRouter();

  return (
    <div className="border-1 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-xl lg:p-8">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {" "}
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="flex-grow text-gray-600">{description}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="rounded bg-transparent px-2 py-1 text-black hover:bg-gray-200 active:bg-gray-300"
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
            <button className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300">
              <EditIcon />
              <span className="text-sm font-medium">Edit</span>
            </button>
            <button className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300">
              <ShareIcon />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button
              onClick={async () => {
                startTransition(async () => {
                  await deleteStreakById(id);
                  router.refresh();
                });
              }}
              className="flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300"
            >
              <DeleteIcon />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-gray-500">Started on: {formattedDate}</span>

        <span className="text-sm text-gray-500">
          {period.charAt(0).toUpperCase() + period.slice(1)} Streak: {streak}
        </span>
      </div>
      <Button
        disabled={isPending}
        onClick={async () => {
          startTransition(async () => {
            await completeStreakById(id);
            router.refresh();
          });
        }}
      >
        {isPending ? "Loading..." : "Complete"}
      </Button>
    </div>
  );
};
