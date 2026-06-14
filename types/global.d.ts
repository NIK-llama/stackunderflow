import { NextResponse } from "next/server";

export interface Tag {
  id: string;
  name: string;
  questions?: number;
}

export interface Author {
  id: string;
  name: string;
  image: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
}

export type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

export type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
export type ErrorResponse = ActionResponse<undefined> & { success: false };

export type APIErrorResponse = NextResponse<ErrorResponse>;
export type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

export interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

export interface Answer {
  id: string;
  author: Author;
  content: string;
  upvotes: number;
  question: string;
  downvotes: number;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  image?: string | null;
  location?: string | null;
  portfolio?: string | null;
  reputation?: number;
  createdAt: Date;
}

interface Collection {
  id: string;
  author: string | Author;
  question: Question;
}