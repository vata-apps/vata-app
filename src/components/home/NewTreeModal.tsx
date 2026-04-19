import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Modal } from './Modal';

type StartingPoint = 'blank' | 'me';

interface NewTreeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; startingPoint: StartingPoint }) => void;
  isPending?: boolean;
  error?: string | null;
}

export function NewTreeModal({ open, onClose, onSubmit, isPending, error }: NewTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState<StartingPoint>('blank');

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setStart('blank');
    }
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      startingPoint: start,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('newTreeModal.title')}
      subtitle={t('newTreeModal.subtitle')}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </button>
          <button
            type="submit"
            form="new-tree-form"
            className="btn btn-primary"
            aria-disabled={!name.trim() || isPending}
          >
            <Plus strokeWidth={1.8} />
            {isPending ? t('newTreeModal.creating') : t('newTreeModal.submit')}
          </button>
        </>
      }
    >
      <form id="new-tree-form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="flabel" htmlFor="nt-name">
            {t('newTreeModal.nameLabel')} <span className="req">*</span>
          </label>
          <input
            id="nt-name"
            className="ds-input"
            type="text"
            autoFocus
            placeholder={t('newTreeModal.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="flabel" htmlFor="nt-desc">
            {t('newTreeModal.descriptionLabel')}{' '}
            <span className="font-normal text-muted-foreground">
              {t('newTreeModal.descriptionOptional')}
            </span>
          </label>
          <textarea
            id="nt-desc"
            className="ds-textarea"
            placeholder={t('newTreeModal.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <span className="flabel">{t('newTreeModal.startLabel')}</span>
          <div className="seg-grid" style={{ ['--seg-cols' as string]: '2' }}>
            <label className="seg-opt" data-selected={start === 'blank'}>
              <input
                type="radio"
                name="nt-start"
                value="blank"
                checked={start === 'blank'}
                onChange={() => setStart('blank')}
              />
              <div className="seg-opt-body">
                <div className="seg-opt-title">{t('newTreeModal.start.blankTitle')}</div>
                <div className="seg-opt-desc">{t('newTreeModal.start.blankDesc')}</div>
              </div>
            </label>
            <label className="seg-opt" aria-disabled="true">
              <input type="radio" name="nt-start" value="me" disabled />
              <div className="seg-opt-body">
                <div className="seg-opt-title">
                  {t('newTreeModal.start.meTitle')}{' '}
                  <span className="soon">{t('importModal.readySoon')}</span>
                </div>
                <div className="seg-opt-desc">{t('newTreeModal.start.meDesc')}</div>
              </div>
            </label>
          </div>
        </div>

        {error && <p className="ferror mt-3">{error}</p>}
      </form>
    </Modal>
  );
}
