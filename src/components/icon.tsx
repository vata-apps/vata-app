import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Baby,
  BookMarked,
  Bug,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  CircleHelp,
  Cross,
  Download,
  EllipsisVertical,
  FolderOpen,
  House,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Mars,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Settings,
  Signature,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  Users,
  Venus,
  X,
  type LucideProps,
} from 'lucide-react';
import { forwardRef, type ComponentType } from 'react';

/**
 * Curated registry of icons available in the app.
 *
 * We deliberately do not re-export every icon `lucide-react` ships. Each entry
 * here is one we actually use somewhere; add a new line when a screen needs
 * one. The kebab-case key is the public name consumers pass via `name="..."`,
 * the value is the underlying `lucide-react` component.
 *
 * Keep the keys sorted alphabetically.
 */
export const iconRegistry = {
  'arrow-down-up': ArrowDownUp,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  baby: Baby,
  'book-marked': BookMarked,
  bug: Bug,
  calendar: Calendar,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevrons-up-down': ChevronsUpDown,
  circle: Circle,
  'circle-help': CircleHelp,
  cross: Cross,
  download: Download,
  'ellipsis-vertical': EllipsisVertical,
  'folder-open': FolderOpen,
  house: House,
  link: Link2,
  'loader-2': Loader2,
  lock: Lock,
  'map-pin': MapPin,
  mars: Mars,
  'notebook-pen': NotebookPen,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  pencil: Pencil,
  plus: Plus,
  search: Search,
  settings: Settings,
  signature: Signature,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  trash: Trash2,
  'triangle-alert': TriangleAlert,
  upload: Upload,
  user: User,
  users: Users,
  venus: Venus,
  x: X,
} as const satisfies Record<string, ComponentType<LucideProps>>;

/**
 * Names of icons available through the {@link Icon} component. Backed by
 * {@link iconRegistry}; extending the registry automatically extends this type.
 */
export type IconName = keyof typeof iconRegistry;

/**
 * Props accepted by {@link Icon}.
 */
export interface IconProps extends Omit<LucideProps, 'ref'> {
  /** Curated icon name; see {@link IconName}. */
  name: IconName;

  /**
   * Pixel size of the rendered SVG (sets both `width` and `height`).
   * Defaults to `16`.
   */
  size?: number;
}

/**
 * Renders a curated icon by name.
 *
 * Defaults `aria-hidden="true"`: most icons in the app sit next to a text
 * label that already carries the meaning, so they should be skipped by
 * assistive tech. When the icon stands alone (no adjacent label), pass an
 * `aria-label` and explicitly set `aria-hidden={false}` to make it announce.
 *
 * @example
 * // Decorative — paired with a label
 * <Icon name="plus" />
 *
 * @example
 * // Standalone, accessible
 * <Icon name="search" aria-hidden={false} aria-label="Search" />
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, 'aria-hidden': ariaHidden, ...props },
  ref
) {
  const LucideIcon = iconRegistry[name];
  return <LucideIcon ref={ref} size={size} aria-hidden={ariaHidden ?? true} {...props} />;
});

Icon.displayName = 'Icon';
