"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { createPreference } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
] as const;

const notificationsFormSchema = z.object({
  enabled: z.boolean(),
  startDate: z.date({
    required_error: "A date for the first notification is required.",
  }),
  hour: z.number().min(0).max(23, { message: "Hour must be between 0 and 23." }),
  minute: z.number().min(0).max(59, { message: "Minute must be between 0 and 59." }),
  period: z.enum(["daily", "weekly"], {
    required_error: "A period is required to schedule notifications.",
  }),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
export const NotificationsForm: React.FC<{
  defaultValues: Partial<NotificationsFormValues>;
}> = ({ defaultValues }) => {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  });
  const router = useRouter();

  async function onSubmit(data: NotificationsFormValues) {
    await createPreference(data);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-secondary p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enabled</FormLabel>
                <FormDescription>
                  When enabled, you will receive notifications about your progress. Notifications will be tailored based
                  on the activity&apos;s description, its current status, and related conversation.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>First Notification Date</FormLabel>
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
                    disabled={(date) => date <= new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Start date for your notifications. Subsequent notifications will follow the set period.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <FormField
            control={form.control}
            name="hour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hour</FormLabel>
                <FormControl>
                  <Input placeholder="Hour" {...field} type="number" />
                </FormControl>
                <FormDescription>Hour for your notifications.(0-23)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minute</FormLabel>
                <FormControl>
                  <Input placeholder="Minute" {...field} type="number" />
                </FormControl>
                <FormDescription>Minute for your notifications.(0-59)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                      variant="outline"
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
                            className={cn("mr-2 h-4 w-4", period.value === field.value ? "opacity-100" : "opacity-0")}
                          />
                          {period.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>Notification frequency.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update account</Button>
      </form>
    </Form>
  );
};
