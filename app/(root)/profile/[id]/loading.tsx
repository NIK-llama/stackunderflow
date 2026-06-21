import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Skeleton className="size-[140px] rounded-full" />

          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-8 w-44 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>

            <Skeleton className="mt-8 h-4 w-80 rounded-md" />
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          <Skeleton className="h-12 w-44 rounded-md" />
        </div>
      </section>

      {/* Stats Cards Skeleton */}
      <div className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <section className="mt-10 flex gap-10">
        <div className="flex-[2] flex flex-col gap-6">
          <Skeleton className="h-11 w-44 rounded-md" />
          
          {[1, 2, 3].map((item) => (
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

        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden gap-4">
          <Skeleton className="h-8 w-28 rounded-md" />
          <div className="mt-3 flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Loading;
