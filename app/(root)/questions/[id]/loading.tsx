import { Skeleton } from "@/components/ui/skeleton";

const QuestionDetailsLoading = () => {
  return (
    <div className="flex flex-col w-full gap-6">
      {/* Author and Votes Header */}
      <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center justify-start gap-1.5">
          {/* Avatar skeleton */}
          <Skeleton className="size-6 rounded-full" />
          {/* Author name skeleton */}
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Votes skeleton */}
        <div className="flex items-center justify-end gap-2.5">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Title skeleton */}
      <div className="mt-2.5">
        <Skeleton className="h-9 w-full sm:w-4/5" />
      </div>

      {/* Metrics skeleton */}
      <div className="flex flex-wrap gap-4 mt-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Content skeleton */}
      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Mock Code Block skeleton */}
      <div className="mt-4 p-4 border border-light-800 dark:border-dark-300 bg-light-800/20 dark:bg-dark-300/20 rounded-lg flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3 bg-light-700/50 dark:bg-dark-400/50" />
        <Skeleton className="h-4 w-2/3 bg-light-700/50 dark:bg-dark-400/50" />
        <Skeleton className="h-4 w-1/2 bg-light-700/50 dark:bg-dark-400/50" />
      </div>

      {/* Tags skeleton */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      {/* Answers Section Header */}
      <div className="mt-12 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Mock Answers List */}
      <div className="mt-6 flex flex-col gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 border-b border-light-800 dark:border-dark-300 pb-8">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-24 ml-auto sm:ml-0" />
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-11/12" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDetailsLoading;
