import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

const FOCUSABLE_SELECTOR =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
}: ModalProps) {
  const { t } = useTranslation('common');
  const titleId = useId();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const shell = shellRef.current;
    if (!shell) return;
    const firstInput = shell.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'
    );
    const focusTarget = firstInput ?? shell.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? shell;
    focusTarget.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      data-open="true"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={shellRef}
        className={`modal-shell${size === 'lg' ? ' modal-shell-lg' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-head">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="modal-title modal-title-serif">
              {title}
            </h2>
            {subtitle && <p className="modal-sub">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal-close btn btn-icon btn-ghost btn-sm"
            onClick={onClose}
            aria-label={t('actions.close')}
          >
            <X strokeWidth={1.7} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
