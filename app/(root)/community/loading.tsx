import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <Skeleton className="h-14 flex-1" />
        <Skeleton className="h-14 w-28" />
      </div>

      <div className="mt-12 flex flex-wrap gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8 xs:w-[230px]"
          >
            {/* Avatar Skeleton */}
            <Skeleton className="size-[100px] rounded-full" />

            {/* Name Skeleton */}
            <Skeleton className="mt-4 h-6 w-28 rounded-md" />

            {/* Username Skeleton */}
            <Skeleton className="mt-2 h-4 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Loading;