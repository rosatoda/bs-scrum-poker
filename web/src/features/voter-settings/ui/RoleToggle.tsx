'use client';

import type { Role } from '@/entities/room';

export function RoleToggle({
  value,
  onChange,
  disabled,
  disabledTitle,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  disabledTitle?: string;
}) {
  return (
    <div className="role-toggle" role="radiogroup" aria-label="Role">
      {(['DEV', 'QA'] as const).map((r) => (
        <button
          key={r}
          type="button"
          className={`btn btn-quiet ${value === r ? 'active' : ''}`}
          aria-pressed={value === r}
          disabled={disabled}
          title={disabled ? disabledTitle : undefined}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
