import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

export interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/** Renders a client-side `<Link>` for internal paths, a plain `<a>` for everything else (external URLs, "tel:", "mailto:", files). */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink({ href, children, ...rest }, ref) {
  const isFileDownload = /\.[a-z0-9]{2,4}$/i.test(href);
  const isInternal = href.startsWith('/') && !href.startsWith('//') && !isFileDownload;

  if (isInternal) {
    return (
      <Link ref={ref} to={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  );
});
