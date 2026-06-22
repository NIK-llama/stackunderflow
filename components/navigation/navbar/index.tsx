import Link from "next/link";
import Image from "next/image";
import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";
import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import GlobalSearch from "@/components/search/GlobalSearch";

const Navbar = async() => {
  const session = await auth();
  return (
    <nav className="flex-between bg-light-900/80 dark:bg-dark-200/80 backdrop-blur-md border-b light-border fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <div className="flex items-center justify-start flex-1">
        <Link href="/" className="flex items-center gap-1">
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-dark-100 dark:text-light-900"
          >
            <rect x="2" y="2" width="19" height="19" rx="4" stroke="currentColor" strokeWidth={2} fill="none"/>
            <path d="M9 7.5L13.5 11.5L9 15.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
            Stack<span className="text-primary-500">UnderFlow</span>
          </p>
        </Link>
      </div>

      <div className="flex-1 flex justify-center max-lg:hidden">
        <GlobalSearch />
      </div>

      <div className="flex items-center justify-end gap-5 flex-1">
        <Theme />

        {session?.user?.id && (
          <UserAvatar
            id={session.user.id}
            name={session.user.name!}
            imageUrl={session.user?.image}
          />
        )}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
