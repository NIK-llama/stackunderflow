"use client";

import { z } from "zod";
import { AskQuestionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useRef, useTransition } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "../cards/TagCard";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import { Loader2 } from "lucide-react";
import { Question } from "@/types/global";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Params {
  question?: Question;
  isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit = false }: Params) => {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] },
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();

      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput]);
        e.currentTarget.value = "";
        form.clearErrors("tags");
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag should be less than 15 characters",
        });
      } else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          type: "manual",
          message: "Tag already exists",
        });
      }
    }
  };

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Tags are required",
      });
    }
  };

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>,
  ) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({
          questionId: question?.id,
          ...data,
        });

        if (result.success) {
          toast.success("Question updated successfully");

          if (result.data) router.push(ROUTES.QUESTION(result.data?.id));
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong",
          });
        }
        return;
      }

      const result = await createQuestion(data);

      if (result.success) {
        toast.success("Question created successfully");

        if (result.data) router.push(ROUTES.QUESTION(result.data?.id));
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

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
            render={({ field, fieldState }) => (
              <Field
                className="flex w-full flex-col"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel className="paragraph-semibold text-dark400_light800">
                  Question Title
                  <span className="text-primary-500">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  className="paragraph-regular background-light900_dark300 light-border-2 
                  text-dark300_light700 no-focus min-h-14 border"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription className="body-regular text-light-500 mt-2.5">
                  Be specific and imagine you&apos;re asking a question to
                  another person.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="flex w-full flex-col"
                data-invalid={fieldState.invalid}
              >
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
                <FieldError>{fieldState.error?.message}</FieldError>
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
                    className="paragraph-regular background-light900_dark300 light-border-2 
                  text-dark300_light700 no-focus min-h-14 border"
                    placeholder="Add tags"
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field?.value?.map((tag: string) => (
                        <TagCard
                          key={tag}
                          id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleTagRemove(tag, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <FieldDescription className="body-regular text-light-500 mt-2.5">
                  Add up to 3 tags to describe what your question is about. You
                  need to press enter to add a tag.
                </FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>

        <div className="mt-16 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient w-fit text-light-900!"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>{isEdit ? "Edit" : "Ask A Question"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
