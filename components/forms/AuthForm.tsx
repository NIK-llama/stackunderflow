"use client";
import { z, ZodType } from "zod";
import { Controller, DefaultValues, FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";


interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean }>;
  formType: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>
  });

//   ********cont....********

  return (
    <div className="p-4 max-w-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="username"
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  id="username"
                  className={
                    fieldState.invalid
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  placeholder="shadcn"
                />
                <FieldDescription>
                  This is your public display name.
                </FieldDescription>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default AuthForm;
