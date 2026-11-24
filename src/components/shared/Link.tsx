'use client';
import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export interface CustomLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'> {
  to?: string;
  href?: string;
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string);
  title?: string;
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function Link({ to, href, children, className, ...props }: CustomLinkProps) {
  const targetHref = href || to || '#';
  const pathname = usePathname();
  const isActive = pathname === targetHref;

  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  const resolvedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <NextLink href={targetHref} className={resolvedClassName} {...props}>
      {resolvedChildren}
    </NextLink>
  );
}

export function NavLink({ to, href, children, className, ...props }: CustomLinkProps) {
  const targetHref = href || to || '#';
  const pathname = usePathname() || '/';
  
  const isActive = targetHref === '/' 
    ? pathname === '/' 
    : pathname === targetHref || pathname.startsWith(`${targetHref}/`);

  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  const resolvedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <NextLink href={targetHref} className={resolvedClassName} {...props}>
      {resolvedChildren}
    </NextLink>
  );
}

export default Link;
