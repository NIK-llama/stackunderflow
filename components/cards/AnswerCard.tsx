import Link from "next/link";

import ROUTES from "@/constants/routes";
import { cn, getTimeStamp } from "@/lib/utils";
import { Answer } from "@/types/global";

import { Preview } from "../editor/Preview";
import UserAvatar from "../UserAvatar";

// Will implement these later when voting and edit/delete actions are added:
// import { hasVoted } from "@/lib/actions/vote.action";
// import Votes from "../votes/Votes";
// import EditDeleteAction from "../user/EditDeleteAction";

interface Props extends Answer {
  containerClasses?: string;
  showReadMore?: boolean;
  showActionBtns?: boolean;
}

const AnswerCard = ({
  id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  question,
  containerClasses,
  showReadMore = false,
  showActionBtns = false,
}: Props) => {
  // Will implement later:
  // const hasVotedPromise = hasVoted({
  //   targetId: id,
  //   targetType: "answer",
  // });

  return (
    <article
      className={cn("light-border border-b py-10 relative", containerClasses)}
    >
      <span id={`answer-${id}`} className="hash-span" />

      {showActionBtns && (
        <div className="background-light800 flex-center absolute -right-2 -top-5 size-9 rounded-full">
          {/* EditDeleteAction will be added later: <EditDeleteAction type="Answer" itemId={id} /> */}
        </div>
      )}

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author.id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link
            href={ROUTES.PROFILE(author.id)}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? "Anonymous"}
            </p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(new Date(createdAt))}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          {/* Votes will be added later:
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              targetType="answer"
              targetId={id}
              hasVotedPromise={hasVotedPromise}
              upvotes={upvotes}
              downvotes={downvotes}
            />
          </Suspense>
          */}
          <div className="flex items-center gap-1">
            <span className="small-medium text-dark400_light800">{upvotes - downvotes} votes</span>
          </div>
        </div>
      </div>

      <Preview content={content} />

      {showReadMore && (
        <Link
          href={`/questions/${question}#answer-${id}`}
          className="body-semibold relative z-10 font-space-grotesk text-primary-500"
        >
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  );
};

export default AnswerCard;