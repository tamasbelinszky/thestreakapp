import { cn } from "@/lib/utils";
import { Activity, Bell, Check, LucideStars, MessageCircle } from "lucide-react";
import { FC, ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
  index: number;
};

export const FeatureCard: FC<FeatureCardProps> = ({ children, icon, title, className, index }) => {
  return (
    <div
      className={cn(
        className,
        "from-gray-2 via-gray-3 to-gray-2 border-gray-6 rounded-xl border bg-gradient-to-br px-8 py-9",
        {
          "bg-green-700 text-white": index % 2 === 0,
          "text-gray-11 bg-secondary": index % 2 === 1,
        },
      )}
    >
      <span className="text-yellow-600">{icon}</span>
      <h2 className="py-4 text-2xl font-extrabold">{title}</h2>
      <div className="text-gray-11 text-sm leading-6">{children}</div>
    </div>
  );
};

export const features = [
  {
    icon: <Check />,
    title: "Creating and Managing Streaks",
    children: (
      <p>
        Seamlessly create, track, and manage your streaks with our intuitive interface. Visualize your progress and stay
        motivated every step of the way.
      </p>
    ),
  },
  {
    icon: <MessageCircle />,
    title: "Personalized Assistance for Each Streak",
    children: (
      <p>
        For every goal you set, there&rsquo;s a tailored chatbot by your side. Get context-aware advice, reminders, and
        motivations that resonate with your objectives.
      </p>
    ),
  },
  {
    icon: <LucideStars />,
    title: "Celebrations",
    children: (
      <p>
        Rejoice in every milestone you achieve. We make sure to recognize and celebrate each of your successes, filling
        your journey with joy and motivation.
      </p>
    ),
  },
  {
    icon: <Bell />,
    title: "Adaptive Notifications",
    children: (
      <p>
        Receive dynamic reminders that evolve based on your goals, their status, and past interactions. Stay aligned,
        informed, and on the path to success.
      </p>
    ),
  },
  {
    icon: <Activity />,
    title: "The Power of Micro Habits",
    children: (
      <p>
        Dive into predefined micro habits and taste the essence of discipline. Experience firsthand how self-control
        leads to contentment, satisfaction, and ultimately, a happier life.
      </p>
    ),
  },
] as const;
