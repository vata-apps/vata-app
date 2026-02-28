import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getTreeDebugData, type TreeDebugData } from '$/db/trees/debug';
import { queryKeys } from '$lib/query-keys';

type TabId = 'overview' | 'individuals' | 'families' | 'events' | 'places' | 'raw';

interface DataBrowserPageProps {
  treeId: string;
}

export function DataBrowserPage({ treeId }: DataBrowserPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.treeDebugData(treeId),
    queryFn: () => getTreeDebugData(),
  });

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'individuals', label: 'Individuals' },
    { id: 'families', label: 'Families' },
    { id: 'events', label: 'Events' },
    { id: 'places', label: 'Places' },
    { id: 'raw', label: 'Raw JSON' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tree/$treeId"
          params={{ treeId }}
          style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          &larr; Back to Tree
        </Link>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>Data Browser</h1>
        <p style={{ color: '#666', margin: 0 }}>Debug view of imported GEDCOM data</p>
      </div>

      {isLoading && <p style={{ color: '#666' }}>Loading data...</p>}
      {error && <p style={{ color: '#c00' }}>Error: {String(error)}</p>}

      {data && (
        <>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: activeTab === tab.id ? '#333' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#666',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                }}
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

function OverviewTab({ data }: { data: TreeDebugData }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Database Overview</h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Record Counts</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '400px' }}>
          <tbody>
            {Object.entries(data.counts).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Tree Metadata</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '600px' }}>
          <tbody>
            {Object.entries(data.meta).map(([key, value]) => (
              <tr key={key}>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                  }}
                >
                  {key}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Event Types</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                ID
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Tag
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Category
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                System
              </th>
            </tr>
          </thead>
          <tbody>
            {data.eventTypes.map((et) => (
              <tr key={et.id}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{et.id}</td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                  }}
                >
                  {et.tag ?? et.customName}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{et.category}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {et.isSystem ? 'Yes' : 'No'}
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Individuals ({data.counts.individuals})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              ID
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Name
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Gender
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Living
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Names Count
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.individuals.map((ind) => {
            const primaryName = ind.names.find((n) => n.isPrimary) ?? ind.names[0];
            const displayName = primaryName
              ? [primaryName.givenNames, primaryName.surname].filter(Boolean).join(' ')
              : '(no name)';

            return (
              <>
                <tr key={ind.id}>
                  <td
                    style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                    }}
                  >
                    {ind.id}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {displayName}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {ind.gender}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {ind.isLiving ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {ind.names.length}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <button
                      onClick={() => setExpandedId(expandedId === ind.id ? null : ind.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        background: expandedId === ind.id ? '#333' : '#fff',
                        color: expandedId === ind.id ? '#fff' : '#333',
                        borderRadius: '3px',
                      }}
                    >
                      {expandedId === ind.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === ind.id && (
                  <tr key={`${ind.id}-details`}>
                    <td colSpan={6} style={{ padding: '1rem', background: '#fafafa' }}>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          overflow: 'auto',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(ind, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FamiliesTab({ data }: { data: TreeDebugData }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Families ({data.counts.families})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              ID
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Husband
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Wife
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Children
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.families.map((fam) => {
            const husband = fam.members.find((m) => m.role === 'husband');
            const wife = fam.members.find((m) => m.role === 'wife');
            const children = fam.members.filter((m) => m.role === 'child');

            return (
              <>
                <tr key={fam.id}>
                  <td
                    style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                    }}
                  >
                    {fam.id}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {husband?.individualName ?? '-'}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {wife?.individualName ?? '-'}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {children.length}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <button
                      onClick={() => setExpandedId(expandedId === fam.id ? null : fam.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        background: expandedId === fam.id ? '#333' : '#fff',
                        color: expandedId === fam.id ? '#fff' : '#333',
                        borderRadius: '3px',
                      }}
                    >
                      {expandedId === fam.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === fam.id && (
                  <tr key={`${fam.id}-details`}>
                    <td colSpan={5} style={{ padding: '1rem', background: '#fafafa' }}>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          overflow: 'auto',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(fam, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EventsTab({ data }: { data: TreeDebugData }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Events ({data.counts.events})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              ID
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Type
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Date
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Place
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Participants
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.events.map((evt) => (
            <>
              <tr key={evt.id}>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                  }}
                >
                  {evt.id}
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                  }}
                >
                  {evt.eventTypeTag ?? evt.eventTypeName}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {evt.dateOriginal ?? '-'}
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderBottom: '1px solid #eee',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={evt.placeName ?? undefined}
                >
                  {evt.placeName ?? '-'}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {evt.participants.length}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      background: expandedId === evt.id ? '#333' : '#fff',
                      color: expandedId === evt.id ? '#fff' : '#333',
                      borderRadius: '3px',
                    }}
                  >
                    {expandedId === evt.id ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedId === evt.id && (
                <tr key={`${evt.id}-details`}>
                  <td colSpan={6} style={{ padding: '1rem', background: '#fafafa' }}>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        overflow: 'auto',
                        maxHeight: '300px',
                      }}
                    >
                      {JSON.stringify(evt, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlacesTab({ data }: { data: TreeDebugData }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Places ({data.counts.places})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              ID
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Name
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Full Name
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              Coordinates
            </th>
          </tr>
        </thead>
        <tbody>
          {data.places.map((place) => (
            <tr key={place.id}>
              <td
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee',
                  fontFamily: 'monospace',
                }}
              >
                {place.id}
              </td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{place.name}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                {place.fullName}
              </td>
              <td
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee',
                  fontFamily: 'monospace',
                }}
              >
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
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0 }}>Raw JSON</h2>
        <button
          onClick={handleCopy}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            border: '1px solid #ddd',
            background: copied ? '#4caf50' : '#fff',
            color: copied ? '#fff' : '#333',
            borderRadius: '4px',
          }}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '70vh',
          fontSize: '0.85rem',
          lineHeight: 1.4,
        }}
      >
        {jsonString}
      </pre>
    </div>
  );
}
