import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { formatLifeYears } from '$components/individuals/person-display';
import { PersonPicker, type PersonPickerSelection } from '$components/individuals/person-picker';
import {
  CHILD_NATURE_OPTIONS,
  isSameRelationDetailsForm,
  SPOUSE_NATURE_OPTIONS,
  toRelationDetailsForm,
  toRelationDetailsPayload,
  type RelationDetailsForm,
} from '$components/person-relations/relation-form';
import { RelationDetail } from '$components/person-relations/relation-detail';
import {
  childLabel,
  siblingLabel,
  spouseLabel,
  type RelationLabelKey,
} from '$components/person-relations/relation-label';
import {
  PersonRelationsFilterToolbar,
  type PersonRelationFilter,
} from '$components/person-relations-filters';
import { button } from '$components/ui/button.css';
import {
  deleteQuestionWithNoteCount,
  DraftFooter,
  InlineDelete,
} from '$components/record-panel/record-actions';
import { DRAFT_ID, RecordPanel } from '$components/record-panel/record-panel';
import { RecordRow } from '$components/record-panel/record-row';
import { Typography } from '$components/ui/typography';
import {
  useAddChildToUnion,
  useAddSibling,
  useCreateUnion,
  useRelationCitations,
  useRemoveChildFromUnion,
  useRemoveParent,
  useRemoveSibling,
  useRemoveSpouse,
  usePersonRelations,
  useSetParent,
  useSetSecondParent,
  useUpdateRelationDetails,
  type PersonRelationsResult,
  type RelationPersonInput,
} from '$hooks/usePersonRelations';
import { useIndividual } from '$hooks/useIndividuals';
import { useRelationNoteCount } from '$hooks/usePersonNotes';
import { formatName } from '$db-tree/names';
import type { RelatedPersonWithGender, RelationDetails } from '$db-tree/person-relations';
import { resetBufferOnError } from '$lib/toast';
import type { RelationCertainty, RelationNature } from '$types/database';

/** Where a new relation lands once created — decides which structural write to run and where the draft row renders. */
type RelationTarget =
  | { kind: 'father' | 'mother' }
  | { kind: 'sibling' }
  | { kind: 'union' }
  | { kind: 'secondParent'; familyId: string }
  | { kind: 'child'; familyId: string };

/** Which card a draft belongs to, for forcing that card open under a filter that would otherwise hide it. */
const ORIGIN_TARGET_KINDS = new Set<RelationTarget['kind']>(['father', 'mother', 'sibling']);
const UNION_TARGET_KINDS = new Set<RelationTarget['kind']>(['union', 'secondParent', 'child']);

interface RelationDraft {
  target: RelationTarget;
  person: RelationPersonInput & { displayName: string; bornYear?: number; deathYear?: number };
}

/** One row's shared display + edit surface, whichever card it renders in. */
interface RelationRowVM {
  id: string;
  /** The related individual's own id — distinct from `id` (which is prefixed per row kind), used to exclude already-related people from a picker. */
  personId: string;
  displayName: string;
  lifespan: string;
  relationLabel: string;
  /** Which shared parent connects a half-sibling — `null` outside the Fratrie card. */
  side: 'paternal' | 'maternal' | null;
  memberId: string;
  familyId: string;
  nature: RelationNature | null;
  certainty: RelationCertainty | null;
  note: string | null;
  natureOptions: RelationNature[];
  sourceCount: number;
  /** Omitted for a half-sibling row — that relation is derived from their own other family, not the subject's to sever (see issue #246). */
  onRemove?: () => void;
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * The Relations tab: every direct relation of one person — parents, siblings,
 * and one card per union (spouse + children) — edited through the shared
 * {@link RecordPanel}.
 *
 * Every row is backed by a real `family_members` row (see
 * `db/trees/person-relations.ts`'s doc comment): a father/mother row edits
 * the *subject's own* row in their parent family (shared between both parent
 * rows), a sibling/spouse/child row edits *that person's own* row. "Type de
 * lien" is therefore always static text, never editable after the fact — see
 * `relation-detail.tsx`.
 *
 * Adding a relation always starts from a picker (there is no "blank" draft to
 * fill in afterward): picking or creating a person both supplies who the
 * relation is with and submits the draft in one step. Nature/certainty/note
 * are set afterward, on the saved row, the same way every other field commits
 * in this tab — on blur for the note, immediately for the selects.
 */
export function PersonRelationsPage(): JSX.Element {
  const { individualId } = useParams({
    from: '/tree/$treeId/individual/$individualId/relations',
  });
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');

  const { data, isLoading, isError } = usePersonRelations(individualId);
  const { data: individual } = useIndividual(individualId);

  const setParent = useSetParent(individualId);
  const removeParent = useRemoveParent(individualId);
  const addSibling = useAddSibling(individualId);
  const removeSibling = useRemoveSibling(individualId);
  const createUnion = useCreateUnion(individualId, individual?.gender ?? 'U');
  const setSecondParent = useSetSecondParent(individualId);
  const removeSpouse = useRemoveSpouse(individualId);
  const addChildToUnion = useAddChildToUnion(individualId);
  const removeChildFromUnion = useRemoveChildFromUnion(individualId);
  const updateDetails = useUpdateRelationDetails(individualId);

  const [filter, setFilter] = useState<PersonRelationFilter>('all');
  const [draft, setDraft] = useState<RelationDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editing buffer for the selected saved row — see PersonNamesPage's identical pattern for why it is re-seeded during render.
  const [buffer, setBuffer] = useState<RelationDetailsForm | null>(null);
  const [bufferFor, setBufferFor] = useState<string | null>(null);

  // Computed with a safe empty fallback while `data` is still loading, so the
  // citations hook just below is called on every render in the same order —
  // see PersonEventsPage's identical `allRows ?? []` pattern. Memoized: this
  // reruns `formatName`/`t()` for every relation, so a keystroke in the note
  // field (which only touches local `buffer` state) shouldn't redo it.
  const rows = useMemo(
    () =>
      buildRows(data, t, {
        onRemoveParent: (role) => removeParent.mutate(role),
        onRemoveSibling: (familyId, siblingId) => removeSibling.mutate({ familyId, siblingId }),
        onRemoveSpouse: (familyId, spouseId) => removeSpouse.mutate({ familyId, spouseId }),
        onRemoveChild: (familyId, childId) => removeChildFromUnion.mutate({ familyId, childId }),
      }),
    [data, t, removeParent, removeSibling, removeSpouse, removeChildFromUnion]
  );

  const isDraftSelected = selectedId === DRAFT_ID && draft !== null;
  const savedRow = isDraftSelected ? undefined : rows.byId.get(selectedId ?? '');
  const activeId = isDraftSelected ? DRAFT_ID : (selectedId ?? undefined);

  // Disabled while nothing is selected yet, since nothing can cite a family
  // that does not exist or isn't known yet.
  const relationCitations = useRelationCitations(savedRow ? savedRow.familyId : null);
  // Feeds the delete confirmation's "this will also delete N notes" warning.
  // Excludes father/mother: removing either deletes that parent's own
  // husband/wife-role row, never `savedRow.memberId` (the subject's own row,
  // shared between both — see useRelationNoteCount's doc comment), so no
  // note is ever at risk there.
  const isParentRow = savedRow?.id === 'father' || savedRow?.id === 'mother';
  const relationNoteCount = useRelationNoteCount(
    savedRow && !isParentRow ? savedRow.memberId : null
  );

  if (isLoading) return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  if (isError || !data) return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;

  const needsBufferSeed = bufferFor !== activeId || (buffer === null && savedRow !== undefined);
  if (!isDraftSelected && savedRow && needsBufferSeed) {
    setBufferFor(activeId ?? null);
    setBuffer(toRelationDetailsForm(savedRow));
  }

  function patchBuffer(patch: Partial<RelationDetailsForm>): void {
    setBuffer((current) => (current ? { ...current, ...patch } : current));
  }

  function commitEdit(patch?: Partial<RelationDetailsForm>): void {
    if (!savedRow || !buffer) return;
    const next = { ...buffer, ...patch };
    if (isSameRelationDetailsForm(toRelationDetailsForm(savedRow), next)) return;
    updateDetails.mutate(
      { memberId: savedRow.memberId, input: toRelationDetailsPayload(next) },
      resetBufferOnError(setBufferFor, savedRow.id)
    );
  }

  function startDraft(target: RelationTarget, selection: PersonPickerSelection): void {
    setDraft({
      target,
      person: {
        id: selection.id,
        createNew: selection.createNew,
        gender: selection.gender,
        displayName: selection.displayName,
        bornYear: selection.bornYear,
        deathYear: selection.deathYear,
      },
    });
    setSelectedId(DRAFT_ID);
  }

  function cancelDraft(): void {
    setDraft(null);
    setSelectedId(null);
  }

  function submitDraft(): void {
    if (!draft) return;
    const person: RelationPersonInput = {
      id: draft.person.id,
      createNew: draft.person.createNew,
      gender: draft.person.gender,
    };

    switch (draft.target.kind) {
      case 'father':
      case 'mother': {
        const { kind: role } = draft.target;
        setParent.mutate({ role, person }, { onSuccess: () => finishDraft(role) });
        return;
      }
      case 'sibling':
        addSibling.mutate(person, {
          onSuccess: (siblingId) => finishDraft(`sibling:${siblingId}`),
        });
        return;
      case 'union':
        createUnion.mutate(person, {
          onSuccess: (familyId) => finishDraft(`spouse:${familyId}`),
        });
        return;
      case 'secondParent': {
        const { familyId } = draft.target;
        setSecondParent.mutate(
          { familyId, person },
          { onSuccess: () => finishDraft(`spouse:${familyId}`) }
        );
        return;
      }
      case 'child': {
        const { familyId } = draft.target;
        addChildToUnion.mutate(
          { familyId, person },
          { onSuccess: (childId) => finishDraft(`child:${childId}`) }
        );
        return;
      }
    }
  }

  function finishDraft(newRowId: string): void {
    setDraft(null);
    setSelectedId(newRowId);
  }

  function isCreating(): boolean {
    return (
      setParent.isPending ||
      addSibling.isPending ||
      createUnion.isPending ||
      setSecondParent.isPending ||
      addChildToUnion.isPending
    );
  }

  let footer: ReactNode = null;
  if (isDraftSelected) {
    footer = (
      <DraftFooter
        createLabel={t('relationsTab.create')}
        canCreate={!!draft}
        isCreating={isCreating()}
        onCancel={cancelDraft}
        onCreate={submitDraft}
      />
    );
  } else if (savedRow && !savedRow.onRemove) {
    // No `onRemove` means this relation isn't the subject's to sever — today
    // that's only a half-sibling row, derived from the other parent's own
    // other family (see issue #246).
    footer = (
      <Typography size="xs" tone="muted">
        {t('relationsTab.delete.halfSiblingNotRemovable')}
      </Typography>
    );
  } else if (savedRow && savedRow.onRemove) {
    const onRemove = savedRow.onRemove;
    footer = (
      <InlineDelete
        key={savedRow.id}
        triggerLabel={t('relationsTab.delete.trigger')}
        question={deleteQuestionWithNoteCount(
          t,
          isParentRow ? 'relationsTab.delete.questionParent' : 'relationsTab.delete.question',
          { name: savedRow.displayName },
          relationNoteCount.data ?? 0
        )}
        isDeleting={
          removeParent.isPending ||
          removeSibling.isPending ||
          removeSpouse.isPending ||
          removeChildFromUnion.isPending
        }
        onDelete={onRemove}
      />
    );
  }

  let detail: ReactNode = null;
  if (isDraftSelected && draft) {
    detail = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography>{draft.person.displayName}</Typography>
        {footer}
      </div>
    );
  } else if (savedRow && buffer) {
    detail = (
      <RelationDetail
        relationLabel={savedRow.relationLabel}
        natureOptions={savedRow.natureOptions}
        value={buffer}
        onChange={patchBuffer}
        onCommit={commitEdit}
        sources={{ count: savedRow.sourceCount, citations: relationCitations.data }}
        footer={footer}
      />
    );
  }

  function renderRow(row: RelationRowVM): ReactNode {
    const sideSuffix = row.side ? ` (${t(`relations.side.${row.side}`)})` : '';
    return (
      <Fragment key={row.id}>
        <RecordRow
          icon="user"
          title={row.displayName}
          meta={`${row.relationLabel}${sideSuffix} · ${row.lifespan || t('relationsTab.lifespanUnknown')}`}
          sourceCount={row.sourceCount}
          isSelected={row.id === activeId}
          onSelect={() => setSelectedId(row.id)}
        />
        {row.id === activeId && detail ? (
          <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
        ) : null}
      </Fragment>
    );
  }

  /** `familyId` narrows to a specific union's draft — without it, a `secondParent`/`child` draft would render inside every union card, not just its own. */
  function renderDraftRow(target: RelationTarget['kind'], familyId?: string): ReactNode {
    if (!draft || draft.target.kind !== target) return null;
    if (
      familyId !== undefined &&
      'familyId' in draft.target &&
      draft.target.familyId !== familyId
    ) {
      return null;
    }
    return (
      <Fragment>
        <RecordRow
          icon="user"
          title={
            <Typography family="serif" tone="muted">
              {draft.person.displayName}
            </Typography>
          }
          isDraft
          isSelected={isDraftSelected}
          onSelect={() => setSelectedId(DRAFT_ID)}
        />
        {isDraftSelected && detail ? (
          <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>
        ) : null}
      </Fragment>
    );
  }

  /** A union card's spouse slot: the spouse row, that slot's own draft, or the "second parent unknown" picker. */
  function renderSpouseSlot(union: BuiltRows['unions'][number]): ReactNode {
    if (union.spouse) return renderRow(union.spouse);
    const draftRow = renderDraftRow('secondParent', union.familyId);
    if (draftRow) return draftRow;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
        <Typography tone="muted" style={{ flex: 1 }}>
          {t('relationsTab.noSpouse')}
        </Typography>
        <PersonPicker
          label={t('relationsTab.add.secondParent')}
          excludeIds={[individualId, ...union.children.map((child) => child.personId)]}
          triggerClassName={button({ variant: 'ghost' })}
          onSelect={(selection) =>
            startDraft({ kind: 'secondParent', familyId: union.familyId }, selection)
          }
        />
      </div>
    );
  }

  // A draft always stays visible once started, like PersonEventsPage's — its
  // own card is forced open even if the filter would otherwise hide it.
  const showOriginCards =
    filter !== 'unions' || (!!draft && ORIGIN_TARGET_KINDS.has(draft.target.kind));
  const showUnionCards =
    filter !== 'origin' || (!!draft && UNION_TARGET_KINDS.has(draft.target.kind));

  const fatherPicker = !data.father ? (
    <PersonPicker
      label={t('relationsTab.add.father')}
      newPersonGender="M"
      excludeIds={[individualId, ...(data.mother ? [data.mother.id] : [])]}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(selection) => startDraft({ kind: 'father' }, selection)}
    />
  ) : null;
  const motherPicker = !data.mother ? (
    <PersonPicker
      label={t('relationsTab.add.mother')}
      newPersonGender="F"
      excludeIds={[individualId, ...(data.father ? [data.father.id] : [])]}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(selection) => startDraft({ kind: 'mother' }, selection)}
    />
  ) : null;
  const siblingPicker = (
    <PersonPicker
      label={t('relationsTab.add.sibling')}
      excludeIds={[
        individualId,
        ...rows.siblings.map((sibling) => sibling.personId),
        ...(data.father ? [data.father.id] : []),
        ...(data.mother ? [data.mother.id] : []),
      ]}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(selection) => startDraft({ kind: 'sibling' }, selection)}
    />
  );
  const unionPicker = (
    <PersonPicker
      label={t('relationsTab.add.union')}
      excludeIds={[
        individualId,
        ...rows.unions.flatMap((union) => (union.spouse ? [union.spouse.personId] : [])),
      ]}
      triggerClassName={button({ variant: 'ghost' })}
      onSelect={(selection) => startDraft({ kind: 'union' }, selection)}
    />
  );

  const parentDraftCount =
    draft && (draft.target.kind === 'father' || draft.target.kind === 'mother') ? 1 : 0;
  const siblingDraftCount = draft && draft.target.kind === 'sibling' ? 1 : 0;

  return (
    <RecordPanel.Root>
      <RecordPanel.Toolbar>
        <PersonRelationsFilterToolbar value={filter} onChange={setFilter} />
        {showUnionCards ? unionPicker : null}
      </RecordPanel.Toolbar>

      <RecordPanel.Body>
        <RecordPanel.List>
          {showOriginCards ? (
            <RecordPanel.ListCard
              title={t('overview.parents.title')}
              count={rows.parents.length + parentDraftCount}
              footer={
                fatherPicker || motherPicker ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {fatherPicker}
                    {motherPicker}
                  </div>
                ) : undefined
              }
            >
              {rows.parents.map(renderRow)}
              {renderDraftRow('father')}
              {renderDraftRow('mother')}
              {data.additionalParentFamilies.map((family) => (
                <Typography
                  key={family.familyId}
                  size="xs"
                  tone="muted"
                  style={{ display: 'block', padding: '4px 12px' }}
                >
                  {additionalParentFamilyLabel(family, t)}
                </Typography>
              ))}
            </RecordPanel.ListCard>
          ) : null}

          {showOriginCards ? (
            <RecordPanel.ListCard
              title={t('relations.labels.sibling')}
              count={rows.siblings.length + siblingDraftCount}
              footer={siblingPicker}
            >
              {rows.siblings.map(renderRow)}
              {renderDraftRow('sibling')}
            </RecordPanel.ListCard>
          ) : null}

          {showUnionCards
            ? rows.unions.map((union, index) => (
                <RecordPanel.ListCard
                  key={union.familyId}
                  title={t('relationsTab.union.title', { count: index + 1 })}
                  count={
                    (union.spouse ? 1 : 0) +
                    union.children.length +
                    (draft?.target.kind === 'child' && draft.target.familyId === union.familyId
                      ? 1
                      : 0)
                  }
                  footer={
                    <PersonPicker
                      label={t('relationsTab.add.child')}
                      excludeIds={[
                        individualId,
                        ...(union.spouse ? [union.spouse.personId] : []),
                        ...union.children.map((child) => child.personId),
                      ]}
                      triggerClassName={button({ variant: 'ghost' })}
                      onSelect={(selection) =>
                        startDraft({ kind: 'child', familyId: union.familyId }, selection)
                      }
                    />
                  }
                >
                  {renderSpouseSlot(union)}
                  {union.children.map(renderRow)}
                  {renderDraftRow('child', union.familyId)}
                </RecordPanel.ListCard>
              ))
            : null}

          {draft?.target.kind === 'union' ? (
            <RecordPanel.ListCard title={t('relationsTab.union.newTitle')} count={1}>
              {renderDraftRow('union')}
            </RecordPanel.ListCard>
          ) : null}
        </RecordPanel.List>

        {detail ? (
          <RecordPanel.Detail
            title={isDraftSelected ? t('relationsTab.newRelation') : t('relationsTab.detailTitle')}
            isDraft={isDraftSelected}
          >
            {detail}
          </RecordPanel.Detail>
        ) : null}
      </RecordPanel.Body>
    </RecordPanel.Root>
  );
}

interface BuildRowsCallbacks {
  onRemoveParent: (role: 'father' | 'mother') => void;
  onRemoveSibling: (familyId: string, siblingId: string) => void;
  onRemoveSpouse: (familyId: string, spouseId: string) => void;
  onRemoveChild: (familyId: string, childId: string) => void;
}

interface BuiltRows {
  parents: RelationRowVM[];
  siblings: RelationRowVM[];
  unions: { familyId: string; spouse: RelationRowVM | null; children: RelationRowVM[] }[];
  byId: Map<string, RelationRowVM>;
}

function personDisplayName(person: RelatedPersonWithGender): string {
  return formatName(person.primaryName).full;
}

/** Read-only summary line for an {@link AdditionalParentFamily} — see its doc comment for why this tab can't offer more than that. */
function additionalParentFamilyLabel(
  family: PersonRelationsResult['additionalParentFamilies'][number],
  t: TranslateFn
): string {
  const father = family.father
    ? personDisplayName(family.father)
    : t('relationsTab.additionalParentFamily.unknownParent');
  const mother = family.mother
    ? personDisplayName(family.mother)
    : t('relationsTab.additionalParentFamily.unknownParent');
  if (!family.pedigree) return t('relationsTab.additionalParentFamily.label', { father, mother });
  return t('relationsTab.additionalParentFamily.labelWithPedigree', {
    father,
    mother,
    pedigree: t(`relationsTab.additionalParentFamily.pedigree.${family.pedigree}`),
  });
}

/**
 * Shapes the query's data into the page's per-card row view-models, and an
 * id-indexed lookup for the selected row. `data` is `undefined` while the
 * query is still loading — returns the empty shape rather than requiring
 * every caller to null-check, so the hook that depends on the result (the
 * citations query) can be called unconditionally before the loading/error
 * early return.
 */
function buildRows(
  data: PersonRelationsResult | undefined,
  t: TranslateFn,
  callbacks: BuildRowsCallbacks
): BuiltRows {
  if (!data) return { parents: [], siblings: [], unions: [], byId: new Map() };

  const counts = data.sourceCountByFamilyId;
  const byId = new Map<string, RelationRowVM>();

  /** Builds one row and registers it in `byId` — every row ends up selectable by its own id, whichever card it renders in. */
  function toRow(
    id: string,
    person: RelatedPersonWithGender,
    details: RelationDetails,
    relationLabelKey: RelationLabelKey,
    natureOptions: RelationNature[],
    onRemove: (() => void) | undefined,
    side: 'paternal' | 'maternal' | null = null
  ): RelationRowVM {
    const row: RelationRowVM = {
      id,
      personId: person.id,
      displayName: personDisplayName(person),
      lifespan: formatLifeYears(person.birthYear ?? undefined, person.deathYear ?? undefined),
      relationLabel: t(`relations.labels.${relationLabelKey}`),
      side,
      memberId: details.memberId,
      familyId: details.familyId,
      nature: details.nature,
      certainty: details.certainty,
      note: details.note,
      natureOptions,
      sourceCount: counts[details.familyId] ?? 0,
      onRemove,
    };
    byId.set(row.id, row);
    return row;
  }

  const parents: RelationRowVM[] = [];
  if (data.parentMembership) {
    const membership = data.parentMembership;
    for (const role of ['father', 'mother'] as const) {
      const person = data[role];
      if (!person) continue;
      parents.push(
        toRow(role, person, membership, role, CHILD_NATURE_OPTIONS, () =>
          callbacks.onRemoveParent(role)
        )
      );
    }
  }

  // A half-sibling row is derived from the other parent's own other family —
  // it isn't the subject's link to sever (see issue #246), so it gets no
  // `onRemove` at all rather than a UI-only gate on an otherwise-live one.
  const siblings = data.siblings.map((sibling) =>
    toRow(
      `sibling:${sibling.id}`,
      sibling,
      sibling,
      siblingLabel(sibling, data.parentFamilyId),
      CHILD_NATURE_OPTIONS,
      sibling.side === null
        ? () => callbacks.onRemoveSibling(sibling.familyId, sibling.id)
        : undefined,
      sibling.side
    )
  );

  const unions = data.spouseUnions.map((union) => {
    const spouseMember = union.spouse;
    const spouse = spouseMember
      ? toRow(
          `spouse:${union.familyId}`,
          spouseMember,
          spouseMember,
          spouseLabel(spouseMember.gender),
          SPOUSE_NATURE_OPTIONS,
          () => callbacks.onRemoveSpouse(union.familyId, spouseMember.id)
        )
      : null;

    const children = union.children.map((child) =>
      toRow(`child:${child.id}`, child, child, childLabel(child.gender), CHILD_NATURE_OPTIONS, () =>
        callbacks.onRemoveChild(union.familyId, child.id)
      )
    );

    return { familyId: union.familyId, spouse, children };
  });

  return { parents, siblings, unions, byId };
}
