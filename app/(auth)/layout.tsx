import SocialAuthForm from "@/components/forms/SocialAuthForm";
import Image from "next/image";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex-center min-h-screen bg-auth-light dark:bg-auth-dark bg-cover bg-center bg-no-repeat px-4 py-10">
      <section className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full rounded-[10px] border py-4 px-10 shadow-md sm:min-w-130 sm:px-8">
        <div className="flex-between gap-2">
          <div className="space-y-2.5">
            <h1 className="h2-bold text-dark100_light900">
              Join StackUnderFlow
            </h1>
            <p className="paragraph-regular text-dark500_light400">
              To get your questions answered
            </p>
          </div>
          <svg
            width="40"
            height="40"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-dark-100 dark:text-light-900"
          >
            <rect x="2" y="2" width="19" height="19" rx="4" stroke="currentColor" strokeWidth={2} fill="none"/>
            <path d="M9 7.5L13.5 11.5L9 15.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        {children}

        <SocialAuthForm />
      </section>
    </main>
  );
};

export default AuthLayout;
