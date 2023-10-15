"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { putPreference } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { basePreferenceSchema } from "@/schemas/preference";
import { ArrowDown, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { TIMEZONES } from "../constants";

type PreferenceFormValues = z.infer<typeof basePreferenceSchema>;

export const PreferenceForm: React.FC<Partial<PreferenceFormValues>> = (props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PreferenceFormValues>({
    defaultValues: props,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await putPreference(data);
      router.refresh();
    });
    console.log("data", data);
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:gap-8">
          <FormField
            control={form.control}
            name="acceptsAppNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-secondary p-3 shadow-sm">
                <div className="flex flex-col gap-2">
                  <FormLabel>App Notifications</FormLabel>
                  <FormDescription>
                    When enabled, you will receive automation emails related to app-level updates and activities.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    defaultChecked={props.acceptsAppNotifications}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptsStreakNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-secondary p-3 shadow-sm">
                <div className="flex flex-col gap-2">
                  <FormLabel>Streak Notifications</FormLabel>
                  <FormDescription>
                    When enabled, you will receive notifications tailored to each individual streak, including its
                    description, current status, and related conversations.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    defaultChecked={props.acceptsStreakNotifications}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
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
                        {field.value ? TIMEZONES.find((timezone) => timezone === field.value) : "Select timezone"}
                        <ArrowDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search timezone..." required />
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup className="max-h-32">
                        {TIMEZONES.map((timezone) => (
                          <CommandItem
                            value={timezone}
                            key={timezone}
                            onSelect={() => {
                              form.setValue("timezone", timezone);
                            }}
                          >
                            <CheckIcon
                              className={cn("mr-2 h-4 w-4", timezone === field.value ? "opacity-100" : "opacity-0")}
                            />
                            {timezone}
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
          <Button disabled={isPending}>{isPending ? "Loading..." : "Update preferences"}</Button>
        </form>
      </Form>
    </div>
  );
};
