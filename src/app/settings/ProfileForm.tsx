"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserName } from "@/lib/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(42, {
      message: "Name must not be longer than 42 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileForm: React.FC<Partial<ProfileFormValues>> = ({ name }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      await updateUserName(data.name);
      router.refresh();
      form.reset();
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:gap-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
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
