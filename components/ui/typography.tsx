import clsx from 'clsx';
import { PropsWithChildren } from 'react';

interface Typography extends PropsWithChildren {
  className?: string;
}

export function H1({ children, className }: Typography) {
  const classes = clsx(
    "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
    className,
  );
  return <h1 className={classes}>{children}</h1>;
}

interface PProps extends Typography {
  isSubtext?: boolean;
}

export function P({ className, children, isSubtext }: PProps) {
  const classes = clsx({
    "leading-7 [&:not(:first-child)]:mt-6": !isSubtext,
    "text-muted-foreground text-sm": isSubtext,
    className,
  });
  return <p className={classes}>{children}</p>;
}
