"use client";

import { StreakFormInput, editStreakById } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { fullStreakSchema } from "@/schemas/streak";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
] as const;

export const EditableStreakCard: React.FC<z.infer<typeof fullStreakSchema> & { isCompleted: boolean; id: string }> = (
  props,
) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<StreakFormInput & { isCompleted: boolean }>({
    resolver: zodResolver(fullStreakSchema),
    defaultValues: props,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await editStreakById(props.id, data);
      router.refresh();
      redirect("/streak");
    });
  });

  return (
    <div className="flex flex-col items-center justify-center gap-1 p-8">
      <Link href={"/streak"} className={buttonVariants({ size: "sm", variant: "ghost" })}>
        <ArrowLeftIcon />
      </Link>
      <h1 className="text-xl font-bold">Edit Streak</h1>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-2 lg:max-w-md">
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
          <FormField
            control={form.control}
            name="isCompleted"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Completed</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} defaultChecked={props.isCompleted} />
                </FormControl>
                <FormDescription className="hidden lg:flex">
                  The state of your action in the given period
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
                        className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                  This is the date that your streak will start. (If you want to continue a streak that you have already
                  started, you can set the start date to the date you started the streak.)
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
                        {field.value ? periods.find((period) => period.value === field.value)?.label : "Select period"}
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
                              className={cn("mr-2 h-4 w-4", period.value === field.value ? "opacity-100" : "opacity-0")}
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} defaultChecked={props.autoComplete} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Loading..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
