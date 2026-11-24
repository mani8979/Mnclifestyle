'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';
import { Link, NavLink } from '../components/shared/Link';

export { Link, NavLink };

export function useNavigate() {
  const router = useRouter();
  return (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const [search, setSearch] = useState('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search || '');
      setHash(window.location.hash || '');
      const handleLocationChange = () => {
        setSearch(window.location.search || '');
        setHash(window.location.hash || '');
      };
      window.addEventListener('hashchange', handleLocationChange);
      window.addEventListener('popstate', handleLocationChange);
      return () => {
        window.removeEventListener('hashchange', handleLocationChange);
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, [pathname]);

  return { pathname, search, hash };
}

export function useParams<T = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [URLSearchParams, (params: Record<string, string> | URLSearchParams) => void] {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const current = new URLSearchParams(searchParams ? searchParams.toString() : '');

  const setSearchParams = (nextParams: Record<string, string> | URLSearchParams) => {
    let nextQuery: URLSearchParams;
    if (nextParams instanceof URLSearchParams) {
      nextQuery = nextParams;
    } else {
      nextQuery = new URLSearchParams();
      Object.entries(nextParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          nextQuery.set(k, v);
        }
      });
    }
    const queryString = nextQuery.toString();
    const target = queryString ? `${pathname}?${queryString}` : (pathname || '/');
    router.push(target);
  };

  return [current, setSearchParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
}
