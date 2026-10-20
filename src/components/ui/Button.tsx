import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'rose' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  isActive?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isIconOnly = false,
  isActive = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  style,
  children,
  type = 'button',
  ...props
}) => {
  // Base class
  const classes = ['vn-btn'];

  // Variant classes
  if (variant === 'primary') classes.push('vn-btn-primary');
  else if (variant === 'rose') classes.push('vn-btn-rose');
  else if (variant === 'danger') classes.push('vn-btn-danger');
  else if (variant === 'success') classes.push('vn-btn-success');
  else if (variant === 'ghost') classes.push('vn-btn-ghost');

  // Active state for ghost/tab buttons
  if (isActive) classes.push('active');

  // Icon only
  if (isIconOnly) classes.push('vn-btn-icon');

  // Size styling overrides using harmonic spacing
  const sizeStyles: React.CSSProperties = {};
  if (size === 'sm') {
    sizeStyles.padding = isIconOnly ? '6px' : '6px 12px';
    sizeStyles.fontSize = '0.84rem';
    sizeStyles.gap = '6px';
  } else if (size === 'lg') {
    sizeStyles.padding = isIconOnly ? '12px' : '12px 24px';
    sizeStyles.fontSize = '1.1rem';
    sizeStyles.gap = '10px';
  }

  if (fullWidth) {
    sizeStyles.width = '100%';
  }

  if (className) {
    classes.push(className);
  }

  return (
    <button
      type={type}
      className={classes.join(' ')}
      style={{ ...sizeStyles, ...style }}
      {...props}
    >
      {isIconOnly ? (
        icon || children
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

