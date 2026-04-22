import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ArrowRight, Upload, X } from 'lucide-react';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { readTextFile, stat } from '@tauri-apps/plugin-fs';
import { GedcomManager } from '$/managers/GedcomManager';
import { Modal } from './Modal';

interface ImportTreeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (treeId: string) => void;
}

interface PickedFile {
  path: string;
  name: string;
  size: string;
  content: string;
  individuals: number;
  families: number;
  errors: number;
  warnings: number;
  valid: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportTreeModal({ open, onClose, onSuccess }: ImportTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [treeName, setTreeName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setTreeName('');
      setError(null);
      setIsImporting(false);
    }
  }, [open]);

  async function pickFile() {
    setError(null);
    const selected = await openDialog({
      multiple: false,
      filters: [{ name: 'GEDCOM', extensions: ['ged', 'gedcom'] }],
    });
    if (!selected) return;
    const path = selected as string;

    try {
      const [content, info] = await Promise.all([readTextFile(path), stat(path)]);
      const validation = GedcomManager.validate(content);
      const name = path.split(/[\\/]/).pop() ?? 'imported.ged';
      setFile({
        path,
        name,
        size: formatSize(info.size ?? 0),
        content,
        individuals: validation.stats.individuals,
        families: validation.stats.families,
        errors: validation.errors.length,
        warnings: 0,
        valid: validation.valid,
      });
      setTreeName(name.replace(/\.[^.]+$/, ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleImport() {
    if (!file || !treeName.trim() || isImporting || !file.valid) return;
    setIsImporting(true);
    setError(null);
    try {
      const result = await GedcomManager.importFromContent(file.content, treeName.trim());
      onSuccess(result.treeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsImporting(false);
    }
  }

  const canImport = !!file && !!treeName.trim() && !isImporting && file.valid;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('importModal.title')}
      subtitle={
        <Trans
          t={t}
          i18nKey="importModal.subtitle"
          components={{
            code: <code className="font-mono text-[11.5px] text-foreground" />,
          }}
        />
      }
      footer={
        <>
          <div className="btn-group-left">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {t('importModal.footNote')}
            </span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canImport}
            aria-disabled={!canImport}
            onClick={handleImport}
          >
            <ArrowRight strokeWidth={1.8} />
            {isImporting ? t('importModal.importing') : t('importModal.submit')}
          </button>
        </>
      }
    >
      {!file ? (
        <button type="button" className="dropzone" onClick={pickFile}>
          <div className="dropzone-icon">
            <Upload size={18} strokeWidth={1.6} />
          </div>
          <div className="dropzone-title">{t('importModal.dropzoneTitle')}</div>
          <div className="dropzone-hint">
            <Trans t={t} i18nKey="importModal.dropzoneHint" components={{ code: <code /> }} />
          </div>
        </button>
      ) : (
        <>
          <div className="file-list">
            <div className="file-row" data-state="done">
              <span className="ged-ico">GED</span>
              <div className="file-row-body">
                <div className="file-row-name">{file.name}</div>
                <div className="file-row-meta">
                  {t('importModal.fileMeta', {
                    size: file.size,
                    version: '5.5.1',
                    encoding: 'UTF-8',
                  })}
                </div>
              </div>
              <div className="file-row-status">
                <span className="badge badge-success">
                  <span className="dot" />
                  {t('importModal.statusReady')}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => setFile(null)}
                aria-label={t('importModal.removeFile')}
              >
                <X strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <div className="scan mt-3">
            <div className="scan-head">
              <h3 className="scan-title">{t('importModal.scanTitle')}</h3>
              <span className="flex-1" />
              <span className="badge badge-success">
                <span className="dot" />
                {t('importModal.scanStatus', {
                  count: file.errors,
                  errors: file.errors,
                  warnings: file.warnings,
                })}
              </span>
            </div>
            <div className="scan-grid">
              <div className="scan-cell">
                <div className="scan-cell-num">{file.individuals}</div>
                <div className="scan-cell-label">{t('importModal.scanLabels.individuals')}</div>
              </div>
              <div className="scan-cell">
                <div className="scan-cell-num">{file.families}</div>
                <div className="scan-cell-label">{t('importModal.scanLabels.families')}</div>
              </div>
              <div className="scan-cell">
                <div className="scan-cell-num">—</div>
                <div className="scan-cell-label">{t('importModal.scanLabels.places')}</div>
              </div>
              <div className="scan-cell">
                <div className="scan-cell-num">—</div>
                <div className="scan-cell-label">{t('importModal.scanLabels.sources')}</div>
              </div>
            </div>
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label className="flabel" htmlFor="mi-name">
              {t('importModal.nameLabel')} <span className="req">*</span>
            </label>
            <input
              id="mi-name"
              className="ds-input"
              type="text"
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
            />
          </div>

          <div className="field">
            <span className="flabel">{t('importModal.optionsLabel')}</span>
            <div className="ds-options-group">
              <label className="toggle-row" aria-disabled="true">
                <div className="toggle-row-body">
                  <div className="toggle-row-title">
                    {t('importModal.options.mergeDuplicatesTitle')}{' '}
                    <span className="soon">{t('importModal.readySoon')}</span>
                  </div>
                  <div className="toggle-row-desc">
                    {t('importModal.options.mergeDuplicatesDesc')}
                  </div>
                </div>
                <span className="switch">
                  <input type="checkbox" disabled readOnly />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                </span>
              </label>
              <label className="toggle-row" aria-disabled="true">
                <div className="toggle-row-body">
                  <div className="toggle-row-title">
                    {t('importModal.options.mediaTitle')}{' '}
                    <span className="soon">{t('importModal.readySoon')}</span>
                  </div>
                  <div className="toggle-row-desc">{t('importModal.options.mediaDesc')}</div>
                </div>
                <span className="switch">
                  <input type="checkbox" disabled readOnly />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                </span>
              </label>
              <label className="toggle-row" aria-disabled="true">
                <div className="toggle-row-body">
                  <div className="toggle-row-title">
                    {t('importModal.options.livingTitle')}{' '}
                    <span className="soon">{t('importModal.readySoon')}</span>
                  </div>
                  <div className="toggle-row-desc">{t('importModal.options.livingDesc')}</div>
                </div>
                <span className="switch">
                  <input type="checkbox" disabled readOnly />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                </span>
              </label>
            </div>
          </div>

          {error && <p className="ferror mt-3">{error}</p>}
        </>
      )}
    </Modal>
  );
}
