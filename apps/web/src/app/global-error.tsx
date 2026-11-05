"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            The error was reported. Try again, and if it keeps happening, reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
