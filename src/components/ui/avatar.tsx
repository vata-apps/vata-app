/**
 * Avatar primitive — a styled Base UI `Avatar` assembly.
 *
 * `Root` sizes and tones the circle; `Image` fills it and falls back to
 * `Fallback` (a monogram, typically) when absent or failing to load — Base UI
 * handles that swap.
 */
import * as React from 'react';
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';

import * as styles from './avatar.css';

export interface AvatarRootProps extends React.ComponentProps<typeof BaseAvatar.Root> {
  /** Circle diameter. */
  size?: 'sm' | 'md' | 'lg';
  /** Fill tone: `accent` (solid, brand-forward), `accentSoft` (tinted, the
   * default), or `neutral` (muted gray, for subordinate references). */
  tone?: 'accent' | 'accentSoft' | 'neutral';
}

function Root({ size = 'md', tone = 'accentSoft', className = '', ...props }: AvatarRootProps) {
  return (
    <BaseAvatar.Root className={`${styles.root({ size, tone })} ${className}`.trim()} {...props} />
  );
}

function Image({ className = '', ...props }: React.ComponentProps<typeof BaseAvatar.Image>) {
  return <BaseAvatar.Image className={`${styles.image} ${className}`.trim()} {...props} />;
}

function Fallback({ className = '', ...props }: React.ComponentProps<typeof BaseAvatar.Fallback>) {
  return <BaseAvatar.Fallback className={`${styles.fallback} ${className}`.trim()} {...props} />;
}

export const Avatar = {
  Root,
  Image,
  Fallback,
};
