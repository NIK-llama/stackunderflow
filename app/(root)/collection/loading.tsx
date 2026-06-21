import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <Skeleton className="h-14 flex-1" />
        <Skeleton className="h-14 w-28" />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="card-wrapper rounded-[10px] p-9 sm:px-11 flex flex-col gap-4"
          >
            <div className="flex-1">
              <Skeleton className="h-4 w-28 rounded-md mb-2 sm:hidden" />
              <Skeleton className="h-6 w-5/6 rounded-md" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>

            <div className="flex-between mt-6 flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Loading;
