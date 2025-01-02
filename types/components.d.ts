// UI Component Type Declarations
import React from 'react';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export interface LoadingButtonProps extends BaseButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  disableWhileLoading?: boolean;
}

export interface ButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export interface IconButtonProps extends BaseButtonProps {
  icon: React.ReactNode;
  ariaLabel: string;
}

export interface ToggleButtonProps extends BaseButtonProps {
  isToggled: boolean;
  onToggle: (newState: boolean) => void;
}

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export interface ButtonContextType {
  variant?: BaseButtonProps['variant'];
  size?: BaseButtonProps['size'];
}

// Utility Types for Component Composition
export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = object, // Changed from {} to object
> = React.PropsWithChildren<
  Props & {
    as?: C;
  }
> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props>;

export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = object, // Changed from {} to object
> = PolymorphicComponentProp<C, Props> & {
  ref?: React.ComponentPropsWithRef<C>['ref'];
};

// Advanced Interaction Types
export interface InteractiveComponentProps {
  disabled?: boolean;
  'aria-disabled'?: boolean;
  tabIndex?: number;
}

export interface AccessibleComponentProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

// Reusable Component Utility Types
export type ComponentStyleVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
export type ComponentSizeVariant = 'default' | 'sm' | 'lg' | 'icon';

// Extend global JSX namespace for custom props
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement> & BaseButtonProps,
        HTMLButtonElement
      >;
    }
  }
}
