/**
 * RecordPanel — the master-detail shell shared by the person tabs that edit a
 * list of facts (Names, Events, Relations, Notes).
 *
 * One record is selected at a time and its detail renders **twice**: inside
 * {@link RecordPanel.InlineDetail}, expanded under the selected row, and inside
 * {@link RecordPanel.Detail}, a sticky panel beside the list. A container query
 * shows exactly one of them — inline while the tab area is narrow, side panel
 * from 900px of container width. Rendering both is what lets the switch be pure
 * CSS; it is only safe because the detail body is controlled by the page, so
 * the two copies can never disagree. See `record-panel.css.ts`.
 *
 * ```tsx
 * <RecordPanel>
 *   <RecordPanel.Toolbar>{filter}{addButton}</RecordPanel.Toolbar>
 *   <RecordPanel.Body>
 *     <RecordPanel.List>
 *       <RecordPanel.ListCard title={t('names.title')} count={rows.length} footer={addButton}>
 *         {rows.map((row) => (
 *           <React.Fragment key={row.id}>
 *             <RecordRow … />
 *             {row.id === selectedId && <RecordPanel.InlineDetail>{detail}</RecordPanel.InlineDetail>}
 *           </React.Fragment>
 *         ))}
 *       </RecordPanel.ListCard>
 *     </RecordPanel.List>
 *     <RecordPanel.Detail title={title} isDraft={isDraft}>{detail}</RecordPanel.Detail>
 *   </RecordPanel.Body>
 * </RecordPanel>
 * ```
 */
import * as React from 'react';

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import * as s from './record-panel.css';

/**
 * Id standing in for the record being created. It is not a database id: it
 * marks the one row that exists only in the form until "create" succeeds, so
 * selection, the dashed row styling and the draft footer can all key off the
 * same value.
 */
export const DRAFT_ID = '__draft';

function Root({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={s.shell}>{children}</div>;
}

function Toolbar({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={s.toolbar}>{children}</div>;
}

function Body({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={s.body}>{children}</div>;
}

function List({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={s.listColumn}>{children}</div>;
}

/** A titled card of records: head with a count pill, the rows, then a footer action. */
function ListCard({
  title,
  count,
  footer,
  children,
}: {
  title: string;
  count: number;
  /** The card's own "add a record" action, repeated from the toolbar. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Card layout="sectioned">
      <div className={card.head}>
        <Typography as="h2" size="md" weight="strong">
          {title}
        </Typography>
        <Badge className={s.count}>{count}</Badge>
      </div>
      {children}
      {footer ? <div className={s.listFooter}>{footer}</div> : null}
    </Card>
  );
}

/** The selected record's detail, expanded under its row while the container is narrow. */
function InlineDetail({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className={s.inlineDetail}>{children}</div>;
}

/** The same detail as a sticky panel beside the list, from 900px of container width. */
function Detail({
  title,
  isDraft = false,
  children,
}: {
  title: string;
  /** Inks the panel title up to mark a record that is not saved yet. */
  isDraft?: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={s.detailColumn}>
      <Card layout="sectioned">
        <div className={`${card.head} ${s.detailHead}`}>
          <Typography as="h2" size="md" weight="strong" tone={isDraft ? 'brand' : 'body'}>
            {title}
          </Typography>
        </div>
        <div className={s.detailContent}>{children}</div>
      </Card>
    </div>
  );
}

export const RecordPanel = {
  Root,
  Toolbar,
  Body,
  List,
  ListCard,
  InlineDetail,
  Detail,
};
