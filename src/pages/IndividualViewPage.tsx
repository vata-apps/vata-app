import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useIndividual } from '$/hooks/useIndividuals';
import { EventTimeline } from '$components/EventTimeline';
import { formatName } from '$/db/trees/names';
import { GENDER_LABELS } from '$/lib/constants';
import { Badge } from '$components/ui/badge';
import { Button } from '$components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

export function IndividualViewPage({ treeId, individualId }: IndividualViewPageProps): JSX.Element {
  const { t } = useTranslation('common');
  const { data: individual, isLoading, isError } = useIndividual(individualId);

  if (isLoading) {
    return <p className="text-muted-foreground">{t('status.loading')}</p>;
  }

  if (isError || !individual) {
    return (
      <div>
        <Link
          to="/tree/$treeId/individuals"
          params={{ treeId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Individuals
        </Link>
        <p className="mt-4 text-destructive">Individual not found.</p>
      </div>
    );
  }

  const name = formatName(individual.primaryName);

  return (
    <div>
      <Link
        to="/tree/$treeId/individuals"
        params={{ treeId }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Individuals
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium italic tracking-tight">{name.full}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {GENDER_LABELS[individual.gender] ?? 'Unknown'}
            {' · '}
            {individual.isLiving ? 'Living' : 'Deceased'}
            {' · '}
            {individual.id}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="Coming soon">
            {t('actions.edit')}
          </Button>
          <Button variant="outline" size="sm" disabled title="Coming soon">
            {t('actions.delete')}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Names</CardTitle>
        </CardHeader>
        <CardContent>
          {individual.names.length === 0 ? (
            <p className="text-muted-foreground">No names recorded.</p>
          ) : (
            <ul className="m-0 space-y-1 pl-5">
              {individual.names.map((n) => (
                <li key={n.id} className="flex items-center gap-2">
                  <span>{formatName(n).full}</span>
                  {n.isPrimary && <Badge variant="secondary">Primary</Badge>}
                  {n.type !== 'birth' && <Badge variant="outline">{n.type}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Events</CardTitle>
        </CardHeader>
        <CardContent>
          <EventTimeline treeId={treeId} individualId={individualId} />
        </CardContent>
      </Card>
    </div>
  );
}
