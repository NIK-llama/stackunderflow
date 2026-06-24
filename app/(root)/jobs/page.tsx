import { Suspense } from "react";
import JobCard from "@/components/cards/JobCard";
import JobsFilter from "@/components/filters/JobFilter";
import Pagination from "@/components/Pagination";
import {
  fetchCountries,
  fetchJobs,
  fetchLocation,
} from "@/lib/actions/job.action";
import { RouteParams, Job } from "@/types/global";
import { Skeleton } from "@/components/ui/skeleton";

interface JobListProps {
  query?: string;
  location?: string;
  page?: string;
  userLocation: string;
}

const JobListSkeleton = () => (
  <div className="mt-10 flex flex-col gap-6">
    {[1, 2, 3, 4, 5].map((item) => (
      <Skeleton key={item} className="h-36 w-full rounded-2xl" />
    ))}
  </div>
);

const JobList = async ({ query, location, page, userLocation }: JobListProps) => {
  let apiQuery = "";
  if (query && location) {
    apiQuery = `${query}, ${location}`;
  } else if (query) {
    apiQuery = query;
  } else if (location) {
    apiQuery = `Software Engineer in ${location}`;
  } else {
    apiQuery = `Software Engineer in ${userLocation}`;
  }

  const jobs = await fetchJobs({
    query: apiQuery,
    page: page ?? "1",
  });

  return (
    <>
      <section className="light-border mb-9 mt-11 flex flex-col gap-9 border-b pb-9">
        {jobs?.length > 0 ? (
          jobs
            ?.filter((job: Job) => job.job_title)
            .map((job: Job) => <JobCard key={job.id || job.job_title} job={job} />)
        ) : (
          <div className="paragraph-regular text-dark200_light800 w-full text-center">
            Oops! We couldn&apos;t find any jobs at the moment. Please try again
            later
          </div>
        )}
      </section>

      {jobs?.length > 0 && (
        <Pagination page={page} isNext={jobs?.length === 10} />
      )}
    </>
  );
};

const Page = async ({ searchParams }: RouteParams) => {
  const { query, location, page } = await searchParams;
  const userLocation = await fetchLocation();
  const countries = await fetchCountries();

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>

      <div className="flex w-full">
        <JobsFilter countriesList={countries} />
      </div>

      <Suspense
        key={`${query || ""}-${location || ""}-${page || ""}`}
        fallback={<JobListSkeleton />}
      >
        <JobList
          query={query}
          location={location}
          page={page}
          userLocation={userLocation}
        />
      </Suspense>
    </>
  );
};

export default Page;