import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTreeDebugData, type TreeDebugData } from '$/db/trees/debug';
import { queryKeys } from '$lib/query-keys';

type TabId = 'overview' | 'individuals' | 'families' | 'events' | 'places' | 'raw';

interface DataBrowserPageProps {
  treeId: string;
}

export function DataBrowserPage({ treeId }: DataBrowserPageProps) {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.treeDebugData(treeId),
    queryFn: () => getTreeDebugData(),
  });

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: t('nav.dataBrowser_overview', 'Overview') },
    { id: 'individuals', label: t('nav.individuals') },
    { id: 'families', label: t('nav.families') },
    { id: 'events', label: t('nav.events') },
    { id: 'places', label: t('nav.places') },
    { id: 'raw', label: t('nav.dataBrowser_raw', 'Raw JSON') },
  ];

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-6">
        <Link
          to="/tree/$treeId"
          params={{ treeId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; {t('actions.back')}
        </Link>
        <h1 className="mt-2 mb-2 text-xl font-bold">{t('nav.dataBrowser')}</h1>
        <p className="m-0 text-muted-foreground">{t('dataBrowser.description')}</p>
      </div>

      {isLoading && <p className="text-muted-foreground">{t('status.loading')}</p>}
      {error && <p className="text-destructive">{t('errors.generic')}</p>}

      {data && (
        <>
          <div className="mb-6 flex gap-2 border-b border-border pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded border-none px-4 py-2 ${
                  activeTab === tab.id
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'individuals' && <IndividualsTab data={data} />}
          {activeTab === 'families' && <FamiliesTab data={data} />}
          {activeTab === 'events' && <EventsTab data={data} />}
          {activeTab === 'places' && <PlacesTab data={data} />}
          {activeTab === 'raw' && <RawJsonTab data={data} />}
        </>
      )}
    </div>
  );
}

const thClass = 'p-2 text-left border-b border-border bg-muted';
const tdClass = 'p-2 border-b border-border';
const tdMonoClass = 'p-2 border-b border-border font-mono';

function OverviewTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2 className="mt-0">{t('dataBrowser.overview')}</h2>

      <div className="mb-8">
        <h3>{t('dataBrowser.recordCounts')}</h3>
        <table className="w-full max-w-[400px] border-collapse">
          <tbody>
            {Object.entries(data.counts).map(([key, value]) => (
              <tr key={key}>
                <td className={tdClass}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </td>
                <td className={`${tdClass} text-right font-mono`}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h3>{t('dataBrowser.treeMetadata')}</h3>
        <table className="w-full max-w-[600px] border-collapse">
          <tbody>
            {Object.entries(data.meta).map(([key, value]) => (
              <tr key={key}>
                <td className={tdMonoClass}>{key}</td>
                <td className={tdClass}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3>{t('dataBrowser.eventTypes')}</h3>
        <table className="w-full max-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Tag</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>System</th>
            </tr>
          </thead>
          <tbody>
            {data.eventTypes.map((et) => (
              <tr key={et.id}>
                <td className={tdClass}>{et.id}</td>
                <td className={tdMonoClass}>{et.tag ?? et.customName}</td>
                <td className={tdClass}>{et.category}</td>
                <td className={tdClass}>
                  {et.isSystem ? t('dataBrowser.yes') : t('dataBrowser.no')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IndividualsTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 className="mt-0">
        {t('nav.individuals')} ({data.counts.individuals})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Name</th>
            <th className={thClass}>Gender</th>
            <th className={thClass}>Living</th>
            <th className={thClass}>Names Count</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.individuals.map((ind) => {
            const primaryName = ind.names.find((n) => n.isPrimary) ?? ind.names[0];
            const displayName = primaryName
              ? [primaryName.givenNames, primaryName.surname].filter(Boolean).join(' ')
              : '(no name)';

            return (
              <React.Fragment key={ind.id}>
                <tr>
                  <td className={tdMonoClass}>{ind.id}</td>
                  <td className={tdClass}>{displayName}</td>
                  <td className={tdClass}>{ind.gender}</td>
                  <td className={tdClass}>
                    {ind.isLiving ? t('dataBrowser.yes') : t('dataBrowser.no')}
                  </td>
                  <td className={tdClass}>{ind.names.length}</td>
                  <td className={tdClass}>
                    <button
                      onClick={() => setExpandedId(expandedId === ind.id ? null : ind.id)}
                      className={`cursor-pointer rounded border px-2 py-1 ${
                        expandedId === ind.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground'
                      }`}
                    >
                      {expandedId === ind.id ? t('dataBrowser.hide') : t('dataBrowser.details')}
                    </button>
                  </td>
                </tr>
                {expandedId === ind.id && (
                  <tr key={`${ind.id}-details`}>
                    <td colSpan={6} className="bg-muted p-4">
                      <pre className="m-0 max-h-[300px] overflow-auto text-sm">
                        {JSON.stringify(ind, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FamiliesTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 className="mt-0">
        {t('nav.families')} ({data.counts.families})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Husband</th>
            <th className={thClass}>Wife</th>
            <th className={thClass}>Children</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.families.map((fam) => {
            const husband = fam.members.find((m) => m.role === 'husband');
            const wife = fam.members.find((m) => m.role === 'wife');
            const children = fam.members.filter((m) => m.role === 'child');

            return (
              <React.Fragment key={fam.id}>
                <tr>
                  <td className={tdMonoClass}>{fam.id}</td>
                  <td className={tdClass}>{husband?.individualName ?? '-'}</td>
                  <td className={tdClass}>{wife?.individualName ?? '-'}</td>
                  <td className={tdClass}>{children.length}</td>
                  <td className={tdClass}>
                    <button
                      onClick={() => setExpandedId(expandedId === fam.id ? null : fam.id)}
                      className={`cursor-pointer rounded border px-2 py-1 ${
                        expandedId === fam.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground'
                      }`}
                    >
                      {expandedId === fam.id ? t('dataBrowser.hide') : t('dataBrowser.details')}
                    </button>
                  </td>
                </tr>
                {expandedId === fam.id && (
                  <tr key={`${fam.id}-details`}>
                    <td colSpan={5} className="bg-muted p-4">
                      <pre className="m-0 max-h-[300px] overflow-auto text-sm">
                        {JSON.stringify(fam, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EventsTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 className="mt-0">
        {t('nav.events')} ({data.counts.events})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Type</th>
            <th className={thClass}>Date</th>
            <th className={thClass}>Place</th>
            <th className={thClass}>Participants</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.events.map((evt) => (
            <React.Fragment key={evt.id}>
              <tr>
                <td className={tdMonoClass}>{evt.id}</td>
                <td className={tdMonoClass}>{evt.eventTypeTag ?? evt.eventTypeName}</td>
                <td className={tdClass}>{evt.dateOriginal ?? '-'}</td>
                <td
                  className={`${tdClass} max-w-[200px] truncate`}
                  title={evt.placeName ?? undefined}
                >
                  {evt.placeName ?? '-'}
                </td>
                <td className={tdClass}>{evt.participants.length}</td>
                <td className={tdClass}>
                  <button
                    onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}
                    className={`cursor-pointer rounded border px-2 py-1 ${
                      expandedId === evt.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    {expandedId === evt.id ? t('dataBrowser.hide') : t('dataBrowser.details')}
                  </button>
                </td>
              </tr>
              {expandedId === evt.id && (
                <tr key={`${evt.id}-details`}>
                  <td colSpan={6} className="bg-muted p-4">
                    <pre className="m-0 max-h-[300px] overflow-auto text-sm">
                      {JSON.stringify(evt, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlacesTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2 className="mt-0">
        {t('nav.places')} ({data.counts.places})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClass}>ID</th>
            <th className={thClass}>Name</th>
            <th className={thClass}>Full Name</th>
            <th className={thClass}>Coordinates</th>
          </tr>
        </thead>
        <tbody>
          {data.places.map((place) => (
            <tr key={place.id}>
              <td className={tdMonoClass}>{place.id}</td>
              <td className={tdClass}>{place.name}</td>
              <td className={tdClass}>{place.fullName}</td>
              <td className={tdMonoClass}>
                {place.latitude && place.longitude
                  ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawJsonTab({ data }: { data: TreeDebugData }) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0">{t('nav.dataBrowser_raw', 'Raw JSON')}</h2>
        <button
          onClick={handleCopy}
          className={`cursor-pointer rounded border px-4 py-2 ${
            copied
              ? 'border-green-600 bg-green-600 text-white'
              : 'border-border bg-background text-foreground'
          }`}
        >
          {copied ? t('dataBrowser.copied') : t('dataBrowser.copyToClipboard')}
        </button>
      </div>
      <pre className="max-h-[70vh] overflow-auto rounded bg-[#1e1e1e] p-4 text-sm leading-relaxed text-[#d4d4d4]">
        {jsonString}
      </pre>
    </div>
  );
}
