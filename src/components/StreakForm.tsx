"use client";

import { StreakFormInput, createStreak } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;

const streakFormSchema = z.object({
  description: z
    .string()
    .max(256, {
      message: "Description must not be longer than 256 characters.",
    })
    .optional(),
  startDate: z
    .any({
      required_error: "A start date is required to count the streak.",
    })
    .optional(),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  numberOfTimesPlanned: z.number(),
});

export const StreakForm = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<StreakFormInput>({
    resolver: zodResolver(streakFormSchema),
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
        <Button>Create New Streak</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-1 overflow-scroll p-4 lg:p-8">
        <DialogTitle>Create New Streak</DialogTitle>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-2 lg:max-w-md">
            <FormField
              control={form.control}
              name="actionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>The action you take</FormLabel>
                  <FormControl>
                    <fieldset disabled>
                      <Input
                        className="disabled bg-gray-800 text-white"
                        disabled
                        {...field}
                        placeholder="Posting on LinkedIn"
                      />
                    </fieldset>
                  </FormControl>
                  <FormDescription className="hidden lg:flex">
                    Only posting on LinkedIn is supported for now.
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
                        required
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
              name="numberOfTimesPlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="truncate">Number of times</FormLabel>
                  <FormControl>
                    <Input
                      className="w-[200px]"
                      type="number"
                      defaultValue={1}
                      min={0}
                      {...form.register("numberOfTimesPlanned", {
                        valueAsNumber: true,
                      })}
                      required
                    />
                  </FormControl>
                  <FormDescription className="hidden lg:flex">
                    This is the number of times you will do the action in the
                    given period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Loading..." : "Start a new streak"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
