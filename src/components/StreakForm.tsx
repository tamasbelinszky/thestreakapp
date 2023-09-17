"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;

const streakFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  description: z
    .string({
      required_error: "Please select a language.",
    })
    .max(256, {
      message: "Description must not be longer than 256 characters.",
    }),
  startDate: z.date({
    required_error: "A start date is required to count the streak.",
  }),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
});

type AccountFormValues = z.infer<typeof streakFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
};

export function StreakForm() {
  const [open, setOpen] = useState(false);
  const { data: sessionData } = useSession();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(streakFormSchema),
    defaultValues,
  });

  async function onSubmit(data: AccountFormValues) {
    console.log(data);
    const userId = sessionData?.user?.id;

    if (!userId) {
      throw new Error("User id is not found.");
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/streak`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        userId,
      }),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Streak</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-2 overflow-scroll p-4 sm:max-w-[625px] lg:p-8">
        <DialogTitle>Create New Streak</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 lg:max-w-md"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription className="hidden lg:flex">
                    This is the short name of your streak, this will appear on
                    the dashboard and in the streak list.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Streak's description" {...field} />
                  </FormControl>
                  <FormDescription className="hidden lg:flex">
                    You can add a description to your streak which can be seen
                    on the given streak item. This can remind you of the purpose
                    of the streak.
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
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) =>
                          new Date(2024) > new Date() ||
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="hidden lg:flex">
                    This is the date that your streak will start. (If you want
                    to continue a streak that you have already started, you can
                    set the start date to the date you started the streak.)
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
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? periods.find(
                                (period) => period.value === field.value,
                              )?.label
                            : "Select period"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search period..." />
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
                                  period.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
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
            <Button type="submit">Start a new streak</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
