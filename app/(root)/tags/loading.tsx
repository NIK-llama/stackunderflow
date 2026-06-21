import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">All Tags</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <Skeleton className="h-14 flex-1" />
        <Skeleton className="h-14 w-28" />
      </div>

      <div className="mt-12 flex flex-wrap gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[250px]"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="size-6 rounded-full" />
            </div>

            <div className="mt-5 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>

            <Skeleton className="mt-4 h-4 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Loading;
