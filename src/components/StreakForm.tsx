"use client";

import { StreakFormInput, createStreak } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { baseStreakSchema } from "@/schemas/streak";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
] as const;

export const StreakForm = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<StreakFormInput>({
    resolver: zodResolver(baseStreakSchema),
    defaultValues: {
      period: "daily",
      autoComplete: true,
      startDate: new Date(),
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await createStreak(data);
      router.refresh();
      setOpen(false);
      form.reset();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"default"} className="hover:animate-pulse">
          Create New Streak
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-1 overflow-scroll p-4 lg:p-8">
        <DialogTitle>Create New Streak</DialogTitle>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-2 lg:max-w-md">
            <div className="gap2 flex w-full flex-col items-center gap-2 sm:flex-row">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Posting on LinkedIn" />
                    </FormControl>
                    <FormDescription className="hidden lg:flex">The name of the action you take.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant={"catchy"}
                onClick={() => {
                  // TODO: good candidate for posthog experiment and / or A/B test
                  const { name, description, period } = getRandomMicroHabit();
                  form.setValue("name", name);
                  form.setValue("description", description);
                  form.setValue("period", period);
                }}
              >
                Randomize Micro Habit
              </Button>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Streak's description" {...field} />
                  </FormControl>
                  <FormDescription className="hidden lg:flex">
                    Add a description to your streak that can be viewed on the respective streak item. This serves as a
                    reminder of the purpose of the streak.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) => new Date(2024) > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        required
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="hidden lg:flex">
                    This is the date that your streak will start. (If you want to continue a streak that you have
                    already started, you can set the start date to the date you started the streak.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Period</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          role="combobox"
                          className={cn("w-[200px] justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? periods.find((period) => period.value === field.value)?.label
                            : "Select period"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search period..." required />
                        <CommandEmpty>No period found.</CommandEmpty>
                        <CommandGroup>
                          {periods.map((period) => (
                            <CommandItem
                              value={period.label}
                              key={period.value}
                              onSelect={() => {
                                form.setValue("period", period.value);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  period.value === field.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {period.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="hidden lg:flex">
                    This is the period that will increase your streak.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="autoComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-secondary p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Auto Complete</FormLabel>
                    <FormDescription>
                      If enabled, the streak will automatically increase once the period ends. You only need to take
                      action if you lose the streak.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Loading..." : "Start a new streak"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const microHabits = [
  // first 10 ref: https://www.thesimplicityhabit.com/micro-habits-that-will-transform-your-life/
  {
    name: "Morning Hydration",
    description:
      "Drinking water upon waking helps rehydrate the body, kickstarting metabolism and aiding in cellular processes essential for good health.",
    period: "daily",
  },
  {
    name: "Hourly Stretching",
    description:
      "Taking short stretch breaks can reduce muscle stiffness, improve circulation, and reduce the risks associated with prolonged sitting.",
    period: "daily",
  },
  {
    name: "Nightly Reading",
    description:
      "Reading before bed can enhance brain connectivity, improve vocabulary, and provide relaxation by reducing stress levels.",
    period: "daily",
  },
  {
    name: "Daily Mindfulness",
    description:
      "Mindfulness and meditation can reduce anxiety, improve mental clarity, and enhance emotional health by regulating stress responses.",
    period: "daily",
  },
  {
    name: "Gratitude Journaling",
    description:
      "Expressing gratitude can improve mental well-being, enhance sleep quality, and foster positive life perspectives.",
    period: "daily",
  },
  {
    name: "Daily Decluttering",
    description:
      "Regular decluttering reduces physical and mental clutter, fostering a sense of control and reducing anxiety.",
    period: "daily",
  },
  {
    name: "Deep Breathing Exercises",
    description:
      "Deep breathing can activate the parasympathetic nervous system, promoting relaxation and reducing stress hormones.",
    period: "daily",
  },
  {
    name: "Setting Daily Goals",
    description:
      "Goal setting provides direction, enhances motivation, and offers a clear focus, leading to improved productivity.",
    period: "daily",
  },
  {
    name: "Quality Family Time",
    description:
      "Spending quality time with family strengthens bonds, improves mental well-being, and fosters a sense of belonging.",
    period: "daily",
  },
  {
    name: "Skill Practice",
    description:
      "Consistent practice can stimulate neural connectivity, promoting skill acquisition and cognitive flexibility.",
    period: "daily",
  },
] as const;

const getRandomMicroHabit = () => {
  return microHabits[Math.floor(Math.random() * microHabits.length)];
};
