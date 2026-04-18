import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, GitFork, Plus, User } from 'lucide-react';

import { cn } from '$lib/utils';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Textarea } from '$components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$components/ui/dialog';

interface NewTreeModalProps {
  isOpen: boolean;
  isPending: boolean;
  error?: string | null;
  onSubmit: (values: { name: string; description?: string }) => void;
  onCancel: () => void;
}

type Template = 'blank' | 'me';

export function NewTreeModal({ isOpen, isPending, error, onSubmit, onCancel }: NewTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<Template>('blank');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setTemplate('blank');
    }
  }, [isOpen]);

  const canSubmit = name.trim().length > 0 && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      onSubmit({ name: name.trim(), description: description.trim() || undefined });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && !isPending && onCancel()}>
      <DialogContent
        className="max-w-[560px] gap-0 overflow-hidden p-0"
        onEscapeKeyDown={(e) => isPending && e.preventDefault()}
        onPointerDownOutside={(e) => isPending && e.preventDefault()}
      >
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <DialogHeader className="flex flex-row items-start gap-3.5 space-y-0 border-b border-border p-6 pb-4 text-left sm:text-left">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary"
            >
              <GitFork className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-serif text-[22px] font-medium italic leading-tight tracking-tight">
                {t('createForm.title')}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed">
                {t('createForm.subtitle')}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 px-6 pb-2 pt-5">
            <div className="space-y-1.5">
              <label
                htmlFor="new-tree-name"
                className="font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-muted-foreground"
              >
                {t('createForm.name')}
              </label>
              <Input
                id="new-tree-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('createForm.namePlaceholder')}
                autoFocus
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-tree-description"
                className="flex items-center gap-1.5 font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-muted-foreground"
              >
                {t('createForm.description')}
                <span className="text-[10px] normal-case tracking-normal text-muted-foreground/70">
                  {t('createForm.descriptionOptional')}
                </span>
              </label>
              <Textarea
                id="new-tree-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('createForm.descriptionPlaceholder')}
                disabled={isPending}
                className="min-h-[66px] resize-none text-sm leading-normal"
              />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-muted-foreground">
                {t('createForm.startingPoint')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <TemplateButton
                  selected={template === 'blank'}
                  onClick={() => setTemplate('blank')}
                  title={t('createForm.templates.blank.title')}
                  meta={t('createForm.templates.blank.meta')}
                  icon={<FileText className="h-[14px] w-[14px]" />}
                />
                <TemplateButton
                  selected={false}
                  disabled
                  title={t('createForm.templates.me.title')}
                  meta={t('createForm.templates.me.meta')}
                  icon={<User className="h-[14px] w-[14px]" />}
                  soonLabel={t('createForm.templates.soon')}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-row items-center gap-2.5 border-t border-border bg-muted/30 px-6 py-3.5 sm:justify-start sm:space-x-0">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {t('createForm.submitHint')}
            </span>
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Plus className="h-3.5 w-3.5" />
              {isPending ? tc('status.creating') : t('createForm.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateButtonProps {
  selected: boolean;
  disabled?: boolean;
  title: string;
  meta: string;
  icon: React.ReactNode;
  soonLabel?: string;
  onClick?: () => void;
}

function TemplateButton({
  selected,
  disabled = false,
  title,
  meta,
  icon,
  soonLabel,
  onClick,
}: TemplateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex flex-col gap-1.5 rounded-md border p-3 text-left transition-colors',
        'border-border bg-background hover:border-border/60',
        selected && 'border-primary bg-primary/5 hover:border-primary',
        disabled && 'cursor-not-allowed opacity-60 hover:border-border'
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground',
          selected && 'border-primary/35 bg-primary/10 text-primary'
        )}
      >
        {icon}
      </span>
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
        {title}
        {soonLabel && (
          <span className="rounded-full border border-border bg-muted/40 px-1.5 py-[1px] font-mono text-[9px] font-normal uppercase tracking-[0.08em] text-muted-foreground">
            {soonLabel}
          </span>
        )}
      </span>
      <span className="font-mono text-[11px] leading-tight text-muted-foreground">{meta}</span>
    </button>
  );
}
