import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useFamily } from '$/hooks/useFamilies';
import { formatName } from '$/db/trees/names';
import { Button } from '$components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
import type { IndividualWithDetails } from '$/types/database';

interface FamilyViewPageProps {
  treeId: string;
  familyId: string;
}

function IndividualLink({
  treeId,
  individual,
  fallback,
}: {
  treeId: string;
  individual: IndividualWithDetails | null;
  fallback: string;
}): JSX.Element {
  if (!individual) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: individual.id }}
      className="text-foreground underline"
    >
      {formatName(individual.primaryName).full}
    </Link>
  );
}

export function FamilyViewPage({ treeId, familyId }: FamilyViewPageProps): JSX.Element {
  const { t } = useTranslation('common');
  const { data: family, isLoading, isError } = useFamily(familyId);

  if (isLoading) {
    return <p className="text-muted-foreground">{t('status.loading')}</p>;
  }

  if (isError || !family) {
    return (
      <div>
        <Link
          to="/tree/$treeId/families"
          params={{ treeId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Families
        </Link>
        <p className="mt-4 text-destructive">Family not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/tree/$treeId/families"
        params={{ treeId }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Families
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Family {family.id}</h1>
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
          <CardTitle className="text-sm font-semibold">Husband</CardTitle>
        </CardHeader>
        <CardContent>
          <IndividualLink treeId={treeId} individual={family.husband} fallback="(No husband)" />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Wife</CardTitle>
        </CardHeader>
        <CardContent>
          <IndividualLink treeId={treeId} individual={family.wife} fallback="(No wife)" />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Children</CardTitle>
        </CardHeader>
        <CardContent>
          {family.children.length === 0 ? (
            <p className="m-0 text-muted-foreground">No children recorded.</p>
          ) : (
            <ul className="m-0 space-y-1 pl-5">
              {family.children.map((child) => (
                <li key={child.id}>
                  <Link
                    to="/tree/$treeId/individual/$individualId"
                    params={{ treeId, individualId: child.id }}
                    className="text-foreground underline"
                  >
                    {formatName(child.primaryName).full}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Marriage</CardTitle>
        </CardHeader>
        <CardContent>
          {!family.marriageEvent ? (
            <p className="m-0 text-muted-foreground">No marriage event recorded.</p>
          ) : (
            <p className="m-0">
              {family.marriageEvent.dateOriginal ?? '(no date)'}
              {family.marriageEvent.place && <> — {family.marriageEvent.place.fullName}</>}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
