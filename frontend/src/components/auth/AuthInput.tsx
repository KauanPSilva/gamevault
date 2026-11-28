import { useState } from 'react';

import type { ComponentPropsWithRef } from 'react';

import {
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';

interface AuthInputProps
  extends ComponentPropsWithRef<'input'> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
}

export function AuthInput({
  id,
  label,
  icon: Icon,
  error,
  type = 'text',
  className = '',
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  const inputType =
    isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />

        <input
          {...props}
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : undefined
          }
          className={`w-full rounded-xl border bg-background py-3.5 pl-12 text-sm outline-none transition-colors placeholder:text-text-muted/60 focus:border-primary ${
            isPassword ? 'pr-12' : 'pr-4'
          } ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={
              showPassword
                ? `Ocultar ${label.toLowerCase()}`
                : `Mostrar ${label.toLowerCase()}`
            }
            disabled={props.disabled}
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}