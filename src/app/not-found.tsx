"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xs">
        <Image
          src="/images/404-logo.png"
          alt="404 Error Illustration"
          width={500}
          height={400}
          priority
          className="mx-auto w-full"
        />
      </div>

      <h1
        className="mt-6 text-center font-sans"
        style={{
          color: "var(--primary-dark)",
          fontWeight: 500,
          fontSize: "42px",
          lineHeight: "125%",
        }}
      >
        404 Error
      </h1>

      <p
        className="mt-4 max-w-xl text-center font-sans"
        style={{
          color: "#000000",
          fontWeight: 400,
          fontSize: "20px",
          lineHeight: "100%",
        }}
      >
        Page not found. We can&apos;t seem to find the page you&apos;re looking
        for. It may have been removed, had its name changed, or is temporarily
        unavailable. Please check the URL for mistakes, or go back to the
        homepage.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full px-8 text-base font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary-dark)" }}
        >
          Home
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border-2 px-8 text-base font-medium transition-colors hover:bg-gray-50"
          style={{
            borderColor: "var(--primary-dark)",
            color: "var(--primary-dark)",
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
