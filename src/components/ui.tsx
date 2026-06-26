import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost";
};

export function Button({ className, tone = "secondary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "border-[#6bbbe0]/70 bg-[#78c7e8] text-[#101416] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:bg-[#8bd2ef]",
        tone === "secondary" && "border-[#34383b] bg-[#15191b] text-[#d4d7d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#464b4f] hover:bg-[#1b2022]",
        tone === "ghost" && "border-transparent bg-transparent text-[#9da2a6] hover:bg-[#171b1d] hover:text-[#f0f2f2]",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 rounded-md border border-[#34383b] bg-[#111416] px-3 text-sm text-[#e4e6e7] outline-none placeholder:text-[#747a80] focus:border-[#6bbbe0]",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-md border border-[#34383b] bg-[#111416] px-3 text-sm text-[#e4e6e7] outline-none focus:border-[#6bbbe0]",
        className,
      )}
      {...props}
    />
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-md border border-[#303437] bg-[#111416]", className)}>{children}</section>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[#303437] bg-[#15191b] px-3 py-2">
      <div className="text-[11px] text-[#8b9095]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#f0f2f2]">{value}</div>
    </div>
  );
}
