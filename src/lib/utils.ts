import {clsx, type ClassValue} from "clsx";
import dayjs from "dayjs";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return dayjs(d).format("HH:mm");
}
