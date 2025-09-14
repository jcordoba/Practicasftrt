import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type HrefLike = string | { pathname?: string; [k: string]: any };

function normalizePath(href: HrefLike): string {
  if (typeof href === "string") {
    try {
      const url = href.startsWith("http")
        ? new URL(href)
        : new URL(href, window.location.origin);
      return url.pathname;
    } catch {
      return href;
    }
  }
  return href?.pathname ?? "/";
}

interface SafeLinkProps extends React.ComponentProps<typeof Link> {
  href: string | { pathname?: string; [k: string]: any };
  children: React.ReactNode;
  className?: string;
}

export default function SafeLink({
  href,
  children,
  className,
  ...props
}: SafeLinkProps) {
  const router = useRouter();
  const current = router.asPath.split("?")[0];
  const target = normalizePath(href as HrefLike);
  
  if (target === current) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }
  
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}