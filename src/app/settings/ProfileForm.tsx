"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateProfile } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { TIMEZONES } from "../constants";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First Name must be at least 2 characters.",
    })
    .max(42, {
      message: "First Name must not be longer than 42 characters.",
    }),
  lastName: z
    .string()
    .max(42, {
      message: "Last Name must not be longer than 42 characters.",
    })
    .optional()
    .default(""),
  timezone: z.enum(TIMEZONES, {
    required_error: "A timezone is required to schedule notifications.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileForm: React.FC<Partial<ProfileFormValues>> = (props) => {
  console.log({ props });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: props,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await updateProfile(data.firstName, data.lastName, data.timezone);
      router.refresh();
      form.reset();
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:gap-8">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormDescription>
                This is your public first name. It can be your real name or a pseudonym. We will use this to address
                you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
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
                    <CommandInput placeholder="Search period..." required />
                    <CommandEmpty>No period found.</CommandEmpty>
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
        <Button type="submit" disabled={isPending}>
          Update profile
        </Button>
      </form>
    </Form>
  );
};
