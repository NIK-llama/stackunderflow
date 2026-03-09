"use client";
import Image from "next/image";
import { Input } from "../ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const searchParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (searchQuery === query) return;

    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParamsString,
          key: "query",
          value: searchQuery,
        });
        router.replace(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParamsString,
            keysToRemove: ["query"],
          });
          router.replace(newUrl, { scroll: false });
        }
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, query, route, searchParamsString, pathname]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 
    grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 
        border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
