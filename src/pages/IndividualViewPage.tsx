import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Separator,
  Skeleton,
  Tabs,
  Text,
} from '@radix-ui/themes';

import { EntityHeader } from '$components/entity-header';
import { EntityStats, type StatItem } from '$components/entity-stats';
import { PersonChip, UnknownPersonChip } from '$components/person-chip';
import { formatName } from '$db-tree/names';
import { useIndividualOverview } from '$hooks/useIndividualOverview';
import {
  computeTimelineSpan,
  type TimelineMarker,
  type TimelineMarkerType,
  type TimelineModel,
} from '$lib/timeline-span';
import type { EventWithDetails, FamilyWithMembers, IndividualWithDetails } from '$types/database';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

// =============================================================================
// Helpers
// =============================================================================

function yearFromDateSort(dateSort: string | null | undefined): number | null {
  if (!dateSort) return null;
  const y = parseInt(dateSort.slice(0, 4), 10);
  return isNaN(y) ? null : y;
}

function formatEventDate(event: EventWithDetails | null | undefined): string | null {
  if (!event) return null;
  return event.dateOriginal ?? (event.dateSort ? event.dateSort.slice(0, 4) : null);
}

function dotColorFor(type: TimelineMarkerType): string {
  if (type === 'estimated-start' || type === 'estimated-end') return 'var(--gray-a7)';
  if (type === 'today') return 'var(--accent-9)';
  if (type === 'birth') return 'var(--green-9)';
  if (type === 'death') return 'var(--gray-11)';
  return 'var(--blue-9)';
}

function formatWithPlace(date: string | null, place: string | null): string | null {
  if (!date) return null;
  return place ? `${date} · ${place}` : date;
}

function getSpouseFromFamily(
  family: FamilyWithMembers,
  focalPersonId: string
): IndividualWithDetails | null {
  if (family.husband?.id === focalPersonId) return family.wife;
  if (family.wife?.id === focalPersonId) return family.husband;
  return family.husband ?? family.wife;
}

function computeRelationsCount(
  individualId: string,
  parentFamilies: FamilyWithMembers[],
  spouseFamilies: FamilyWithMembers[]
): number {
  const parentsCount = parentFamilies.reduce(
    (n, f) => n + (f.husband ? 1 : 0) + (f.wife ? 1 : 0),
    0
  );
  const siblingsCount = parentFamilies.reduce(
    (n, f) => n + f.children.filter((c) => c.id !== individualId).length,
    0
  );
  const spousesCount = spouseFamilies.reduce((n, f) => {
    const spouse = getSpouseFromFamily(f, individualId);
    return n + (spouse ? 1 : 0);
  }, 0);
  const childrenCount = spouseFamilies.reduce((n, f) => n + f.children.length, 0);
  return parentsCount + siblingsCount + spousesCount + childrenCount;
}

// =============================================================================
// Timeline
// =============================================================================

interface TimelineSpanViewProps {
  model: Extract<TimelineModel, { kind: 'span' }>;
  todayLabel: string;
}

function TimelineSpanView({ model, todayLabel }: TimelineSpanViewProps): JSX.Element {
  const spanYears = model.end - model.start;

  function markerPct(year: number): number {
    const pct = ((year - model.start) / spanYears) * 100;
    return Math.max(1, Math.min(99, pct));
  }

  function markerLabel(m: TimelineMarker): string {
    if (m.type === 'estimated-start' || m.type === 'estimated-end') return '?';
    if (m.type === 'today') return todayLabel;
    return String(m.year);
  }

  function markerGlyph(m: TimelineMarker): string {
    if (m.type === 'birth') return '✱';
    if (m.type === 'death') return '†';
    if (m.type === 'marriage') return '∞';
    return '';
  }

  return (
    <Box style={{ position: 'relative', height: '72px', paddingInline: '12px' }}>
      {/* Axis */}
      <Box
        style={{
          position: 'absolute',
          top: '36px',
          left: '12px',
          right: '12px',
          height: '2px',
          background: 'var(--gray-a5)',
          borderRadius: '1px',
        }}
      />
      {/* Axis start year */}
      <Text size="1" color="gray" style={{ position: 'absolute', left: '12px', top: '44px' }}>
        {model.start}
      </Text>
      {/* Axis end year */}
      <Text
        size="1"
        color="gray"
        style={{ position: 'absolute', right: '12px', top: '44px', textAlign: 'right' }}
      >
        {model.end}
      </Text>

      {model.markers.map((marker, i) => {
        const isEstimate = marker.type === 'estimated-start' || marker.type === 'estimated-end';
        const dotColor = dotColorFor(marker.type);

        return (
          <Box
            key={`${marker.type}-${i}`}
            style={{
              position: 'absolute',
              left: `calc(12px + (100% - 24px) * ${markerPct(marker.year) / 100})`,
              top: '28px',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0',
            }}
          >
            <Text
              size="1"
              color="gray"
              style={{
                whiteSpace: 'nowrap',
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
              }}
            >
              {markerGlyph(marker)} {markerLabel(marker)}
            </Text>
            <Box
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isEstimate ? 'transparent' : dotColor,
                border: isEstimate ? `2px dashed var(--gray-a7)` : `2px solid ${dotColor}`,
                flexShrink: 0,
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

interface TimelineSectionProps {
  individual: IndividualWithDetails;
  spouseFamilies: FamilyWithMembers[];
}

function TimelineSection({ individual, spouseFamilies }: TimelineSectionProps): JSX.Element | null {
  const { t } = useTranslation('individuals');

  const birthYear = yearFromDateSort(individual.birthEvent?.dateSort);
  const deathYear = yearFromDateSort(individual.deathEvent?.dateSort);
  const marriageYears = spouseFamilies
    .map((f) => yearFromDateSort(f.marriageEvent?.dateSort))
    .filter((y): y is number => y !== null);

  const model = computeTimelineSpan({
    birthYear,
    marriageYears,
    deathYear,
    isLiving: individual.isLiving,
    todayYear: new Date().getFullYear(),
  });

  if (model.kind === 'no-timeline') return null;

  return (
    <Box mb="5">
      <Heading size="3" mb="3">
        {t('overview.timeline.heading')}
      </Heading>
      <Card>
        {model.kind === 'birth-only' ? (
          <Flex align="center" gap="3" py="2">
            <Box
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--green-9)',
                flexShrink: 0,
              }}
            />
            <Text size="2" color="gray">
              ✱ {model.birthYear}
            </Text>
          </Flex>
        ) : (
          <TimelineSpanView model={model} todayLabel={t('overview.timeline.today')} />
        )}
      </Card>
    </Box>
  );
}

// =============================================================================
// Family section
// =============================================================================

interface FamilyCardMetaProps {
  family: FamilyWithMembers;
}

function FamilyCardMeta({ family }: FamilyCardMetaProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const date = formatEventDate(family.marriageEvent);
  const place = family.marriageEvent?.place?.name;

  return (
    <Flex direction="column" align="end" flexShrink="0">
      <Text size="1" color="gray">
        {date
          ? t('overview.family.marriageDate', { date: place ? `${date} · ${place}` : date })
          : t('overview.family.marriageDateUnknown')}
      </Text>
      <Badge size="1" variant="outline" color="gray">
        {family.id}
      </Badge>
    </Flex>
  );
}

interface ParentsFamilyCardProps {
  family: FamilyWithMembers;
  treeId: string;
}

function ParentsFamilyCard({ family, treeId }: ParentsFamilyCardProps): JSX.Element {
  return (
    <Card mb="3">
      <Flex justify="between" align="start" gap="4">
        <Flex gap="4" wrap="wrap" flexGrow="1">
          {family.husband ? (
            <PersonChip individual={family.husband} treeId={treeId} />
          ) : (
            <UnknownPersonChip />
          )}
          {family.wife ? (
            <PersonChip individual={family.wife} treeId={treeId} />
          ) : (
            <UnknownPersonChip />
          )}
        </Flex>
        <FamilyCardMeta family={family} />
      </Flex>
    </Card>
  );
}

interface MarriageFamilyCardProps {
  family: FamilyWithMembers;
  focalPersonId: string;
  treeId: string;
}

function MarriageFamilyCard({
  family,
  focalPersonId,
  treeId,
}: MarriageFamilyCardProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const spouse = getSpouseFromFamily(family, focalPersonId);
  const hasChildren = family.children.length > 0;

  return (
    <Card mb="3">
      <Flex justify="between" align="start" gap="4" mb={hasChildren ? '3' : undefined}>
        <Box flexGrow="1">
          {spouse ? <PersonChip individual={spouse} treeId={treeId} /> : <UnknownPersonChip />}
        </Box>
        <FamilyCardMeta family={family} />
      </Flex>

      {hasChildren && (
        <>
          <Separator size="4" mb="3" />
          <Text size="1" color="gray" mb="2" as="div">
            {t('overview.family.childrenHeading')}
          </Text>
          <Grid columns={{ initial: '2', sm: '4' }} gap="1">
            {family.children.map((child) => (
              <PersonChip key={child.id} individual={child} treeId={treeId} />
            ))}
          </Grid>
        </>
      )}
    </Card>
  );
}

interface FamilySectionProps {
  individualId: string;
  parentFamilies: FamilyWithMembers[];
  spouseFamilies: FamilyWithMembers[];
  treeId: string;
}

function FamilySection({
  individualId,
  parentFamilies,
  spouseFamilies,
  treeId,
}: FamilySectionProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Box mb="5">
      <Heading size="3" mb="3">
        {t('overview.family.heading')}
      </Heading>

      <Heading size="2" color="gray" mb="2">
        {t('overview.family.parents')}
      </Heading>
      {parentFamilies.length === 0 ? (
        <Text size="2" color="gray" mb="4" as="p">
          {t('overview.family.noParentFamily')}
        </Text>
      ) : (
        parentFamilies.map((family) => (
          <ParentsFamilyCard key={family.id} family={family} treeId={treeId} />
        ))
      )}

      <Heading size="2" color="gray" mb="2" mt="4">
        {t('overview.family.marriages')}
      </Heading>
      {spouseFamilies.length === 0 ? (
        <Text size="2" color="gray" as="p">
          {t('overview.family.noMarriages')}
        </Text>
      ) : (
        spouseFamilies.map((family) => (
          <MarriageFamilyCard
            key={family.id}
            family={family}
            focalPersonId={individualId}
            treeId={treeId}
          />
        ))
      )}
    </Box>
  );
}

// =============================================================================
// Vitals
// =============================================================================

interface VitalRowProps {
  label: string;
  value: string | null;
}

function VitalRow({ label, value }: VitalRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Flex
      justify="between"
      align="baseline"
      py="1"
      style={{ borderBottom: '1px solid var(--gray-a3)' }}
    >
      <Text size="2" color="gray">
        {label}
      </Text>
      <Text size="2">{value ?? t('overview.vitals.noData')}</Text>
    </Flex>
  );
}

interface VitalsSectionProps {
  individual: IndividualWithDetails;
}

function VitalsSection({ individual }: VitalsSectionProps): JSX.Element {
  const { t } = useTranslation('individuals');

  const names = individual.names;
  const birthDate = formatEventDate(individual.birthEvent);
  const birthPlace = individual.birthEvent?.place?.name ?? null;
  const deathDate = formatEventDate(individual.deathEvent);
  const deathPlace = individual.deathEvent?.place?.name ?? null;

  return (
    <Box flexGrow="1" minWidth="0">
      <Heading size="3" mb="3">
        {t('overview.vitals.heading')}
      </Heading>
      <Card>
        <Flex direction="column" gap="0">
          <Box mb="3">
            <Text size="1" color="gray" weight="medium">
              {t('overview.vitals.namesLabel')}
            </Text>
            {names.length === 0 ? (
              <Text size="2">{t('overview.vitals.noData')}</Text>
            ) : (
              names.map((name) => (
                <Flex key={name.id} align="baseline" gap="2" mt="1">
                  <Text size="2">{formatName(name).full}</Text>
                  <Badge size="1" variant="soft" color="gray">
                    {name.type}
                  </Badge>
                  {name.isPrimary && (
                    <Badge size="1" variant="soft" color="indigo">
                      primary
                    </Badge>
                  )}
                </Flex>
              ))
            )}
          </Box>
          <VitalRow
            label={t('overview.vitals.birth')}
            value={formatWithPlace(birthDate, birthPlace)}
          />
          <VitalRow label={t('overview.vitals.baptism')} value={null} />
          <VitalRow
            label={t('overview.vitals.death')}
            value={formatWithPlace(deathDate, deathPlace)}
          />
          <VitalRow label={t('overview.vitals.burial')} value={null} />
        </Flex>
      </Card>
    </Box>
  );
}

// =============================================================================
// Media placeholder
// =============================================================================

function MediaSection(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Box width="200px" flexShrink="0">
      <Heading size="3" mb="3">
        {t('overview.media.heading')}
      </Heading>
      <Card>
        <Text size="2" color="gray">
          {t('overview.media.empty')}
        </Text>
      </Card>
    </Box>
  );
}

// =============================================================================
// Places lived placeholder
// =============================================================================

function PlacesLivedSection(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Box mb="5">
      <Heading size="3" mb="3">
        {t('overview.placesLived.heading')}
      </Heading>
      <Card>
        <Text size="2" color="gray">
          {t('overview.placesLived.empty')}
        </Text>
      </Card>
    </Box>
  );
}

// =============================================================================
// Right rail
// =============================================================================

interface RailCardProps {
  heading: string;
  empty: string;
}

function RailCard({ heading, empty }: RailCardProps): JSX.Element {
  return (
    <Card mb="3">
      <Heading size="2" mb="2">
        {heading}
      </Heading>
      <Text size="2" color="gray">
        {empty}
      </Text>
    </Card>
  );
}

function RailSection(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Box width="240px" flexShrink="0">
      <RailCard
        heading={t('overview.rail.quickActions.heading')}
        empty={t('overview.rail.quickActions.empty')}
      />
      <RailCard
        heading={t('overview.rail.researchNotes.heading')}
        empty={t('overview.rail.researchNotes.empty')}
      />
      <RailCard
        heading={t('overview.rail.suggestions.heading')}
        empty={t('overview.rail.suggestions.empty')}
      />
    </Box>
  );
}

// =============================================================================
// Overview tab content
// =============================================================================

type OverviewTabKey = 'overview' | 'pedigree' | 'events' | 'relations' | 'sources' | 'notes';

interface OverviewContentProps {
  individual: IndividualWithDetails;
  parentFamilies: FamilyWithMembers[];
  spouseFamilies: FamilyWithMembers[];
  treeId: string;
  onTabChange: (tab: OverviewTabKey) => void;
}

function OverviewContent({
  individual,
  parentFamilies,
  spouseFamilies,
  treeId,
  onTabChange,
}: OverviewContentProps): JSX.Element {
  const { t } = useTranslation('individuals');

  // ---- header ----
  const primaryName = individual.primaryName;
  const allNames = individual.names;
  const title = primaryName ? formatName(primaryName).full : t('overview.unknownPerson');
  const extraNameCount = allNames.length > 1 ? allNames.length - 1 : 0;

  const titleChip =
    extraNameCount > 0 ? (
      <Badge variant="soft" color="gray">
        {t('overview.plusNames', { count: extraNameCount })}
      </Badge>
    ) : undefined;

  const birthDate = formatEventDate(individual.birthEvent);
  const deathDate = formatEventDate(individual.deathEvent);

  const headerMeta = [
    {
      label: t('overview.meta.sex'),
      value: t(`overview.meta.gender.${individual.gender}`),
    },
    { label: t('overview.meta.id'), value: individual.id },
    ...(birthDate ? [{ label: '✱', value: birthDate }] : []),
    ...(deathDate ? [{ label: '†', value: deathDate }] : []),
  ];

  const badges: string[] = [];
  if (individual.isLiving && !individual.deathEvent) {
    badges.push(t('overview.badge.living'));
  }

  // ---- stats ----
  const relationsCount = computeRelationsCount(individual.id, parentFamilies, spouseFamilies);

  const stats: StatItem[] = [
    { label: t('overview.stats.events'), value: 0, onClick: () => onTabChange('events') },
    {
      label: t('overview.stats.relations'),
      value: relationsCount,
      onClick: () => onTabChange('relations'),
    },
    { label: t('overview.stats.sources'), value: 0, onClick: () => onTabChange('sources') },
    { label: t('overview.stats.media'), value: 0 },
    { label: t('overview.stats.genUp'), value: 0, onClick: () => onTabChange('pedigree') },
    { label: t('overview.stats.genDown'), value: 0, onClick: () => onTabChange('pedigree') },
  ];

  return (
    <Flex gap="5" p="5" align="start">
      {/* Main column */}
      <Box flexGrow="1" minWidth="0">
        <EntityHeader title={title} titleChip={titleChip} meta={headerMeta} badges={badges} />

        <EntityStats stats={stats} />

        <FamilySection
          individualId={individual.id}
          parentFamilies={parentFamilies}
          spouseFamilies={spouseFamilies}
          treeId={treeId}
        />

        <TimelineSection individual={individual} spouseFamilies={spouseFamilies} />

        <Flex gap="4" mb="5" align="start">
          <VitalsSection individual={individual} />
          <MediaSection />
        </Flex>

        <PlacesLivedSection />
      </Box>

      {/* Right rail */}
      <RailSection />
    </Flex>
  );
}

// =============================================================================
// Page shell
// =============================================================================

const TAB_KEYS: OverviewTabKey[] = [
  'overview',
  'pedigree',
  'events',
  'relations',
  'sources',
  'notes',
];

export function IndividualViewPage({ treeId, individualId }: IndividualViewPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<OverviewTabKey>('overview');

  const { data, isLoading, isError } = useIndividualOverview(individualId);

  return (
    <Box>
      <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as OverviewTabKey)}>
        <Box px="5" pt="4" style={{ borderBottom: '1px solid var(--gray-a4)' }}>
          <Tabs.List>
            {TAB_KEYS.map((key) => (
              <Tabs.Trigger key={key} value={key}>
                {t(`overview.tabs.${key}`)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Box>

        <Tabs.Content value="overview">
          {isLoading && (
            <Flex direction="column" gap="3" p="5">
              <Skeleton width="200px" height="28px" />
              <Skeleton width="320px" height="16px" />
              <Skeleton width="100%" height="80px" />
            </Flex>
          )}

          {isError && (
            <Box p="5">
              <Text color="red">{tCommon('errors.loadFailed')}</Text>
            </Box>
          )}

          {!isLoading && !isError && !data && (
            <Box p="5">
              <Text color="gray">{t('overview.notFound')}</Text>
            </Box>
          )}

          {data && (
            <OverviewContent
              individual={data.individual}
              parentFamilies={data.parentFamilies}
              spouseFamilies={data.spouseFamilies}
              treeId={treeId}
              onTabChange={setActiveTab}
            />
          )}
        </Tabs.Content>

        {TAB_KEYS.filter((k) => k !== 'overview').map((key) => (
          <Tabs.Content key={key} value={key} />
        ))}
      </Tabs.Root>
    </Box>
  );
}
