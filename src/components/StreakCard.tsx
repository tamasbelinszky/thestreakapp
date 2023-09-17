import { format } from "date-fns";
import React from "react";

interface StreakCardProps {
  name: string;
  description: string;
  startDate: Date;
  period: string;
  streak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  name,
  description,
  startDate,
  period,
  streak,
}) => {
  const formattedDate = format(startDate, "yyyy.MM.dd");

  return (
    <div className="border-1 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-xl lg:p-8">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="flex-grow text-gray-600">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Started on: {formattedDate}
        </span>
        <span className="text-sm text-gray-500">
          {period.charAt(0).toUpperCase() + period.slice(1)} Streak: {streak}
        </span>
      </div>
    </div>
  );
};
