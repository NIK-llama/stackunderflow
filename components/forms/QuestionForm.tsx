"use client";

import { AskQuestionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false
})

const QuestionForm = () => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const form = useForm({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const handleCreateQuestion = () => {};

  return (
    <div>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleCreateQuestion)}
      >
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <Field className="flex w-full flex-col">
                <FieldLabel className="paragraph-semibold text-dark400_light800">
                  Question Title
                  <span className="text-primary-500">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  className="paragraph-regular background-light900_dark300 light-border-2 
                  text-dark300_light700 no-focus min-h-14 border"
                />
                <FieldDescription className="body-regular text-light-500 mt-2.5">
                  Be specific and imagine you&apos;re asking a question to
                  another person.
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <Field className="flex w-full flex-col">
                <FieldLabel className="paragraph-semibold text-dark400_light800">
                  Detailed explanation of your problem{" "}
                  <span className="text-primary-500">*</span>
                </FieldLabel>
                <Editor
                  value={field.value}
                  editorRef={editorRef}
                  fieldChange={field.onChange}
                />
                <FieldDescription className="body-regular text-light-500 mt-2.5">
                  Introduce the problem and expand on what you&apos;ve put in
                  the title.
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex w-full flex-col gap-3"
              >
                <FieldLabel className="paragraph-semibold text-dark400_light800">
                  Tags
                  <span className="text-primary-500">*</span>
                </FieldLabel>
                <div>
                  <Input
                    {...field}
                    className="paragraph-regular background-light900_dark300 light-border-2 
                  text-dark300_light700 no-focus min-h-14 border"
                    placeholder="Add tags"
                  />
                  Tags
                </div>
                <FieldDescription className="body-regular text-light-500 mt-2.5">
                  Add up to 3 tags to describe what your question is about. You
                  need to press enter to add a tag.
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>

        <div className="mt-16 flex justify-end">
          <Button
            type="submit"
            className="primary-gradient w-fit text-light-900!"
          >
            Ask A Question
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
