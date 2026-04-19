import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { GedcomManager } from '$/managers/GedcomManager';
import { openTreeDb } from '$/db/connection';
import { Modal } from './Modal';

type DownloadFormat = 'ged' | 'json' | 'zip';

interface DownloadTreeModalProps {
  open: boolean;
  onClose: () => void;
  tree: {
    id: string;
    name: string;
    path: string;
    individualCount: number;
    familyCount: number;
  } | null;
  onSuccess: () => void;
}

export function DownloadTreeModal({ open, onClose, tree, onSuccess }: DownloadTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const [format, setFormat] = useState<DownloadFormat>('ged');
  const [includeSources, setIncludeSources] = useState(true);
  const [hideLiving, setHideLiving] = useState(false);
  const [includePrivateNotes, setIncludePrivateNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormat('ged');
      setIncludeSources(true);
      setHideLiving(false);
      setIncludePrivateNotes(false);
      setError(null);
      setIsExporting(false);
    }
  }, [open]);

  async function handleExport() {
    if (!tree || isExporting) return;
    setIsExporting(true);
    setError(null);
    try {
      await openTreeDb(tree.path);
      const ok = await GedcomManager.exportToFile(tree.name, !hideLiving);
      if (ok) {
        onSuccess();
      } else {
        setIsExporting(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsExporting(false);
    }
  }

  const estimatedSizeMb = tree
    ? ((tree.individualCount * 600) / (1024 * 1024) || 0).toFixed(1)
    : '0';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('downloadModal.title')}
      subtitle={
        <Trans
          t={t}
          i18nKey="downloadModal.subtitle"
          values={{ name: tree?.name ?? '' }}
          components={{
            b: <b className="font-medium text-foreground" />,
          }}
        />
      }
      footer={
        <>
          <div className="btn-group-left">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {t('downloadModal.footNote')}
            </span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            aria-disabled={!tree || isExporting}
            onClick={handleExport}
          >
            <Download strokeWidth={1.8} />
            {isExporting ? t('downloadModal.exporting') : t('downloadModal.submit')}
          </button>
        </>
      }
    >
      <div className="field">
        <span className="flabel">{t('downloadModal.formatLabel')}</span>
        <div className="seg-grid" style={{ ['--seg-cols' as string]: '1', gap: 8 }}>
          <label className="seg-opt" data-selected={format === 'ged'}>
            <input
              type="radio"
              name="dl-format"
              value="ged"
              checked={format === 'ged'}
              onChange={() => setFormat('ged')}
            />
            <div className="seg-opt-body">
              <div className="seg-opt-title">
                {t('downloadModal.formats.gedTitle')}{' '}
                <code className="font-mono text-[11.5px] font-normal text-muted-foreground">
                  {t('downloadModal.formats.gedExt')}
                </code>
              </div>
              <div className="seg-opt-desc">{t('downloadModal.formats.gedDesc')}</div>
            </div>
          </label>
          <label className="seg-opt" aria-disabled="true">
            <input type="radio" name="dl-format" value="json" disabled />
            <div className="seg-opt-body">
              <div className="seg-opt-title">
                {t('downloadModal.formats.jsonTitle')}{' '}
                <code className="font-mono text-[11.5px] font-normal text-muted-foreground">
                  {t('downloadModal.formats.jsonExt')}
                </code>{' '}
                <span className="soon">{t('importModal.readySoon')}</span>
              </div>
              <div className="seg-opt-desc">{t('downloadModal.formats.jsonDesc')}</div>
            </div>
          </label>
          <label className="seg-opt" aria-disabled="true">
            <input type="radio" name="dl-format" value="zip" disabled />
            <div className="seg-opt-body">
              <div className="seg-opt-title">
                {t('downloadModal.formats.zipTitle')}{' '}
                <code className="font-mono text-[11.5px] font-normal text-muted-foreground">
                  {t('downloadModal.formats.zipExt')}
                </code>{' '}
                <span className="soon">{t('importModal.readySoon')}</span>
              </div>
              <div className="seg-opt-desc">{t('downloadModal.formats.zipDesc')}</div>
            </div>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="flabel" htmlFor="dl-gedcom-version">
          {t('downloadModal.versionLabel')}{' '}
          <span className="soon">{t('importModal.readySoon')}</span>
        </label>
        <select id="dl-gedcom-version" className="ds-select" disabled>
          <option>5.5.1 — standard</option>
        </select>
        <div className="fhint">{t('downloadModal.versionHint')}</div>
      </div>

      <div className="field">
        <span className="flabel">{t('downloadModal.optionsLabel')}</span>
        <div className="ds-options-group">
          <label className="toggle-row">
            <div className="toggle-row-body">
              <div className="toggle-row-title">{t('downloadModal.options.sourcesTitle')}</div>
              <div className="toggle-row-desc">
                <Trans
                  t={t}
                  i18nKey="downloadModal.options.sourcesDesc"
                  components={{ code: <code className="font-mono text-[11px]" /> }}
                />
              </div>
            </div>
            <span className="switch">
              <input
                type="checkbox"
                checked={includeSources}
                onChange={(e) => setIncludeSources(e.target.checked)}
              />
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </span>
          </label>
          <label className="toggle-row">
            <div className="toggle-row-body">
              <div className="toggle-row-title">{t('downloadModal.options.hideLivingTitle')}</div>
              <div className="toggle-row-desc">{t('downloadModal.options.hideLivingDesc')}</div>
            </div>
            <span className="switch">
              <input
                type="checkbox"
                checked={hideLiving}
                onChange={(e) => setHideLiving(e.target.checked)}
              />
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </span>
          </label>
          <label className="toggle-row">
            <div className="toggle-row-body">
              <div className="toggle-row-title">{t('downloadModal.options.privateNotesTitle')}</div>
              <div className="toggle-row-desc">{t('downloadModal.options.privateNotesDesc')}</div>
            </div>
            <span className="switch">
              <input
                type="checkbox"
                checked={includePrivateNotes}
                onChange={(e) => setIncludePrivateNotes(e.target.checked)}
              />
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </span>
          </label>
        </div>
      </div>

      {tree && (
        <div className="ds-meta-grid mt-[4px]">
          <StatCell label={t('downloadModal.statsIndividuals')} value={tree.individualCount} />
          <StatCell label={t('downloadModal.statsFamilies')} value={tree.familyCount} />
          <StatCell label={t('downloadModal.statsSize')} value={`~ ${estimatedSizeMb} MB`} />
        </div>
      )}

      {error && <p className="ferror mt-3">{error}</p>}
    </Modal>
  );
}

function StatCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="ds-meta-cell-label">{label}</div>
      <div className="ds-meta-cell-value">{value}</div>
    </div>
  );
}
