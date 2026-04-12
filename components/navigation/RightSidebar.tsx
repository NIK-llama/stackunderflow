import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import TagCard from "../cards/TagCard";

const hotQuestions = [
  { id: "1", title: "How to create custom hook in React?" },
  { id: "2", title: "How to use React Query?" },
  { id: "3", title: "How to use Redux?" },
  { id: "4", title: "How to use React Router?" },
  { id: "5", title: "How to use React Context?" },
];

const popularTags = [
  { id: "1", name: "react", questions: 100 },
  { id: "2", name: "javascript", questions: 200 },
  { id: "3", name: "typescript", questions: 50 },
  { id: "5", name: "react-query", questions: 75 },
];

const RightSidebar = () => {
  return (
    <section
      className="pt-26 custom-scrollbar background-light900_dark200 
    light-border sticky right-0 top-0 flex h-screen w-87.5 flex-col gap-6 
    overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-7.5">
          {hotQuestions.map(({ id, title }) => (
            <Link
              key={id}
              href={ROUTES.PROFILE(id)}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>
              <Image
                src="/icons/chevron-right.svg"
                alt="Chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-14">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ id, name, questions }) => (
            <TagCard
              key={id}
              id={id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
