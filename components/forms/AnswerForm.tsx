"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { AnswerSchema } from "@/lib/validations";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const session = useSession();

  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      });

      if (result.success) {
        form.reset();
        toast.success("Answer posted successfully");

        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast.error(result.error?.message ?? "Something went wrong");
      }
    });
  };

  const generateAIAnswer = async () => {
    if (session.status !== "authenticated") {
      return toast.error("Please log in", {
        description: "You need to be logged in to use this feature",
      });
    }

    setIsAISubmitting(true);

    const userAnswer = editorRef.current?.getMarkdown();

    try {
      const { success, data, error } = await api.ai.getAnswer(
        questionTitle,
        questionContent,
        userAnswer,
      );

      if (!success || !data) {
        return toast.error("Error", {
          description: error?.message || "Failed to generate AI answer",
        });
      }

      const formattedAnswer = data.replace(/<br>/g, " ").toString().trim();

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);

        form.setValue("content", formattedAnswer);
        form.trigger("content");
      }

      toast.success("Success", {
        description: "AI generated answer has been generated",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "There was a problem with your request",
      });
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                width={12}
                height={12}
                alt="Generate AI Answer"
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-6 flex w-full flex-col gap-10"
      >
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              className="flex w-full flex-col gap-3"
              data-invalid={fieldState.invalid}
            >
              <div className="mt-3.5">
                <Editor
                  value={field.value}
                  editorRef={editorRef}
                  fieldChange={field.onChange}
                />
              </div>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="primary-gradient w-fit">
            {isAnswering ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Answer"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;
