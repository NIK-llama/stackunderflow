"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Theme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={`cursor-pointer ${theme === "light" ? "text-primary-500" : "text-dark100_light900"}`}
          onClick={() => setTheme("light")}
        >
          <Sun className={`mr-2 h-4 w-4 ${theme === "light" ? "text-primary-500" : ""}`} /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`cursor-pointer ${theme === "dark" ? "text-primary-500" : "text-dark100_light900"}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className={`mr-2 h-4 w-4 ${theme === "dark" ? "text-primary-500" : ""}`} /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`cursor-pointer ${theme === "system" ? "text-primary-500" : "text-dark100_light900"}`}
          onClick={() => setTheme("system")}
        >
          <Monitor className={`mr-2 h-4 w-4 ${theme === "system" ? "text-primary-500" : ""}`} /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Theme;
