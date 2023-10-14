"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateNamePreference } from "@/lib/preferences";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileForm: React.FC<Partial<ProfileFormValues>> = ({ firstName, lastName }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName,
      lastName,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await updateNamePreference(data.firstName, data.lastName);
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
        <Button type="submit" disabled={isPending}>
          Update profile
        </Button>
      </form>
    </Form>
  );
};
