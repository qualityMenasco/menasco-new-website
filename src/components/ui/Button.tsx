import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import { iconSizes } from '../../styles/tokens';
import type { IconComponent, Size, Theme } from '../../types';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-small gap-1.5',
  md: 'h-10 px-5 text-body gap-2',
  lg: 'h-12 px-6 text-body-lg gap-2.5',
};

const textLinkSizeClasses: Record<Size, string> = {
  sm: 'text-small gap-1',
  md: 'text-body gap-1.5',
  lg: 'text-body-lg gap-1.5',
};

const iconSizeBySize: Record<Size, number> = {
  sm: iconSizes.sm,
  md: iconSizes.md,
  lg: iconSizes.lg,
};

function variantClasses(variant: ButtonVariant, theme: Theme): string {
  const light = theme === 'light';
  switch (variant) {
    case 'primary':
      return 'bg-brand-600 text-warmwhite hover:bg-brand-700 active:bg-brand-800 disabled:bg-gray-300 disabled:text-gray-500';
    case 'secondary':
      return light
        ? 'bg-ink text-warmwhite hover:bg-charcoal active:bg-graphite disabled:bg-gray-300 disabled:text-gray-500'
        : 'bg-warmwhite text-ink hover:bg-gray-100 active:bg-gray-200 disabled:bg-white/20 disabled:text-white/40';
    case 'outline':
      return light
        ? 'border border-gray-300 text-ink hover:border-ink hover:bg-ink/[0.03] disabled:border-gray-200 disabled:text-gray-400'
        : 'border border-white/30 text-warmwhite hover:border-white hover:bg-white/10 disabled:border-white/10 disabled:text-white/30';
    case 'ghost':
      return light
        ? 'text-ink hover:bg-ink/[0.05] disabled:text-gray-400'
        : 'text-warmwhite hover:bg-white/10 disabled:text-white/30';
    case 'text':
      return light
        ? 'text-brand-600 hover:text-brand-700 disabled:text-gray-400'
        : 'text-brand-400 hover:text-brand-300 disabled:text-white/30';
    default:
      return '';
  }
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: Size;
  theme?: Theme;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

export interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> {
  href?: undefined;
}

export interface ButtonLinkProps extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> {
  href: string;
}

function useButtonRender({
  variant = 'primary',
  size = 'md',
  theme,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
}: CommonProps & { disabled?: boolean }) {
  const resolvedTheme = useSectionTheme(theme);
  const isText = variant === 'text';
  const iconSize = iconSizeBySize[size];

  const classes = cn(
    'group inline-flex items-center justify-center font-sans font-semibold transition-colors duration-base ease-engineered whitespace-nowrap',
    'disabled:cursor-not-allowed',
    isText ? textLinkSizeClasses[size] : cn('rounded-md', sizeClasses[size]),
    isText && 'underline-offset-4 hover:underline',
    fullWidth && 'w-full',
    variantClasses(variant, resolvedTheme),
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden="true" />
      ) : (
        LeadingIcon && <LeadingIcon size={iconSize} aria-hidden="true" />
      )}
      <span className={loading ? 'opacity-80' : undefined}>{children}</span>
      {!loading && TrailingIcon && (
        <TrailingIcon
          size={iconSize}
          aria-hidden="true"
          className="transition-transform duration-base ease-engineered group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  return { classes, content, disabled: disabled || loading };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { type = 'button', disabled, ...props },
  ref,
) {
  const { classes, content, disabled: isDisabled } = useButtonRender({ ...props, disabled });
  return (
    <button ref={ref} type={type} disabled={isDisabled} aria-busy={props.loading} className={classes} {...extractDomProps(props)}>
      {content}
    </button>
  );
});

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink({ href, ...props }, ref) {
  const { classes, content, disabled } = useButtonRender(props);

  if (disabled) {
    return (
      <a ref={ref} aria-disabled className={classes} {...extractDomProps(props)}>
        {content}
      </a>
    );
  }

  return (
    <SmartLink ref={ref} href={href} className={classes} {...extractDomProps(props)}>
      {content}
    </SmartLink>
  );
});

// Strips the styling-only props before spreading the rest onto the DOM node.
function extractDomProps<T extends CommonProps>(props: T) {
  const { variant, size, theme, leadingIcon, trailingIcon, loading, fullWidth, children, className, ...dom } = props;
  return dom;
}

// ---------------------------------------------------------------------------
// IconButton — icon-only affordance (uses the same variant language as Button).
// ---------------------------------------------------------------------------

const iconButtonSizeClasses: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconComponent;
  label: string;
  variant?: ButtonVariant;
  size?: Size;
  theme?: Theme;
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', theme, loading = false, disabled, type = 'button', className, ...rest },
  ref,
) {
  const resolvedTheme = useSectionTheme(theme);
  const iconSize = iconSizeBySize[size];
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-busy={loading}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors duration-base ease-engineered disabled:cursor-not-allowed',
        iconButtonSizeClasses[size],
        variantClasses(variant, resolvedTheme),
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={iconSize} className="animate-spin" aria-hidden="true" /> : <Icon size={iconSize} aria-hidden="true" />}
    </button>
  );
});
