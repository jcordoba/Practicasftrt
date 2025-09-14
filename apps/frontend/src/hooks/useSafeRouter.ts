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

export function useSafeRouter() {
  const router = useRouter();
  
  function safePush(path: string) {
    try {
      const target = normalizePath(path);
      const current = router.asPath.split("?")[0];
      if (target !== current) router.push(path);
    } catch {
      window.location.href = path;
    }
  }
  
  function safeReplace(path: string) {
    try {
      const target = normalizePath(path);
      const current = router.asPath.split("?")[0];
      if (target !== current) router.replace(path);
    } catch {
      window.location.replace(path);
    }
  }
  
  return { safePush, safeReplace };
}