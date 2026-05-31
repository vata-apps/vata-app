import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  DataList,
  Flex,
  Grid,
  Heading,
  IconButton,
  SegmentedControl,
  Separator,
  Text,
} from '@radix-ui/themes';

import packageJson from '../../package.json';
import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { DeleteTreeModal } from '$components/trees/delete-tree-modal';
import { DownloadTreeModal } from '$components/trees/download-tree-modal';
import { EditTreeModal } from '$components/trees/edit-tree-modal';
import { ImportGedcomModal } from '$components/trees/import-gedcom-modal';
import { NewTreeModal } from '$components/trees/new-tree-modal';
import { getAllTrees } from '$db-system/trees';
import { TreeManager } from '$managers/TreeManager';
import { formatIsoDate } from '$lib/format';
import { queryKeys } from '$lib/query-keys';
import type { Tree } from '$types/database';

type SortKey = 'recent' | 'name' | 'size';

function sortTrees(trees: Tree[], key: SortKey): Tree[] {
  const copy = [...trees];
  if (key === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (key === 'size') {
    copy.sort((a, b) => b.individualCount - a.individualCount);
  } else {
    copy.sort((a, b) => {
      const aTime = a.lastOpenedAt ?? a.createdAt;
      const bTime = b.lastOpenedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    });
  }
  return copy;
}

/**
 * A pure-`@radix-ui/themes` rebuild of the home page (the trees picker), a
 * sibling experiment to {@link IndividualOverviewRadixPage}. Every element is a
 * stock Radix Themes component — `Container`, `Heading`, `Badge`, `Separator`,
 * `DataList`, `Card` — with no custom CSS (no gradients, `clamp()` fonts, dashed
 * circles, or fixed-width mono rows) and none of the bespoke `TreeCard` /
 * `TreeCardCta` / `TreeSectionDivider` / `AppStatusBar` organisms. The curated
 * `Icon` is kept for action affordances, matching the person-overview-radix
 * experiment.
 *
 * Wired to the live tree database and the real create/import/edit/delete/export
 * dialogs so the experiment is fully functional, not a static mock.
 */
export function HomeRadixPage(): JSX.Element {
  const { t } = useTranslation(['common', 'trees']);
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('recent');
  const [newTreeOpen, setNewTreeOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportingTree, setExportingTree] = useState<Tree | null>(null);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [deletingTree, setDeletingTree] = useState<Tree | null>(null);

  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const sortedTrees = useMemo<Tree[]>(() => (trees ? sortTrees(trees, sort) : []), [trees, sort]);

  const sortOptions: Array<{ value: SortKey; label: string }> = [
    { value: 'recent', label: t('trees:home.sortRecent') },
    { value: 'name', label: t('trees:home.sortName') },
    { value: 'size', label: t('trees:home.sortSize') },
  ];

  const handleOpen = async (treeId: string): Promise<void> => {
    try {
      await TreeManager.open(treeId);
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    } catch (err) {
      console.error('Failed to open tree:', err);
      window.alert(t('common:errors.failedToOpenDatabase'));
    }
  };

  return (
    <Flex direction="column" height="100vh">
      <Box flexGrow="1" overflow="auto">
        <Container size="4" px="5" py="9">
          {/* Hero */}
          <Box mb="9">
            <Heading as="h1" size="9" weight="regular">
              {t('trees:home.title')} <Text color="indigo">{t('trees:home.titleAccent')}</Text>
            </Heading>
            <Flex align="center" gap="3" mt="5" wrap="wrap">
              <Button size="3" onClick={() => setNewTreeOpen(true)}>
                <Icon name="plus" size={16} />
                {t('trees:home.heroNew')}
              </Button>
              <Button size="3" variant="soft" onClick={() => setImportOpen(true)}>
                <Icon name="download" size={16} />
                {t('trees:home.heroImport')}
              </Button>
            </Flex>
          </Box>

          {/* Section header */}
          <Flex align="center" gap="3" mb="5">
            <Text size="2" color="gray">
              {t('trees:home.sectionLabel')}
            </Text>
            <Badge variant="soft" radius="full" size="1">
              {sortedTrees.length}
            </Badge>
            <Box flexGrow="1">
              <Separator size="4" />
            </Box>
            <SegmentedControl.Root
              size="1"
              value={sort}
              onValueChange={(next) => setSort(next as SortKey)}
              aria-label={t('trees:home.sortAriaLabel')}
            >
              {sortOptions.map((option) => (
                <SegmentedControl.Item key={option.value} value={option.value}>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Flex>

          {/* Trees grid */}
          {error && <Text color="gray">{t('common:errors.loadFailed')}</Text>}
          {!error && isLoading && <Text color="gray">{t('trees:loading')}</Text>}
          {!error && !isLoading && (
            <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="5">
              {sortedTrees.map((tree) => (
                <Card key={tree.id} size="3">
                  <Flex direction="column" gap="4" height="100%">
                    <Box>
                      <Heading as="h2" size="6" weight="regular" truncate>
                        {tree.name}
                      </Heading>
                      {tree.description && (
                        <Text as="p" size="2" color="gray" mt="2">
                          {tree.description}
                        </Text>
                      )}
                    </Box>

                    <Flex gap="6">
                      <Flex direction="column">
                        <Text size="7" weight="bold">
                          {tree.individualCount}
                        </Text>
                        <Text size="1" color="gray">
                          {t('trees:card.individuals')}
                        </Text>
                      </Flex>
                      <Flex direction="column">
                        <Text size="7" weight="bold">
                          {tree.familyCount}
                        </Text>
                        <Text size="1" color="gray">
                          {t('trees:card.families')}
                        </Text>
                      </Flex>
                    </Flex>

                    <Box>
                      <Separator size="4" mb="3" />
                      <DataList.Root size="1" orientation="horizontal">
                        <DataList.Item>
                          <DataList.Label minWidth="88px">
                            {t('trees:card.createdAt')}
                          </DataList.Label>
                          <DataList.Value>{formatIsoDate(tree.createdAt)}</DataList.Value>
                        </DataList.Item>
                        <DataList.Item>
                          <DataList.Label minWidth="88px">
                            {t('trees:card.lastAccessedAt')}
                          </DataList.Label>
                          <DataList.Value>{formatIsoDate(tree.lastOpenedAt)}</DataList.Value>
                        </DataList.Item>
                      </DataList.Root>
                    </Box>

                    <Flex align="center" gap="3" mt="auto">
                      <Box flexGrow="1" asChild>
                        <Button variant="soft" size="3" onClick={() => void handleOpen(tree.id)}>
                          <Icon name="folder-open" size={16} />
                          {t('trees:card.open')}
                          <Icon name="arrow-right" size={16} />
                        </Button>
                      </Box>
                      <IconButton
                        variant="ghost"
                        size="3"
                        color="gray"
                        aria-label={t('trees:card.export')}
                        onClick={() => setExportingTree(tree)}
                      >
                        <Icon name="download" size={16} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="3"
                        color="gray"
                        aria-label={t('trees:card.edit')}
                        onClick={() => setEditingTree(tree)}
                      >
                        <Icon name="pencil" size={16} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="3"
                        color="gray"
                        aria-label={t('trees:card.delete')}
                        onClick={() => setDeletingTree(tree)}
                      >
                        <Icon name="trash" size={16} />
                      </IconButton>
                    </Flex>
                  </Flex>
                </Card>
              ))}

              {/* Add-a-tree CTA tile */}
              <Card size="3" asChild>
                <button type="button" onClick={() => setNewTreeOpen(true)}>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="3"
                    height="100%"
                    minHeight="240px"
                  >
                    <Icon name="plus" size={28} />
                    <Flex direction="column" align="center" gap="1">
                      <Text size="2" weight="medium">
                        {t('trees:cta.title')}
                      </Text>
                      <Text size="1" color="gray">
                        {t('trees:cta.subtitle')}
                      </Text>
                    </Flex>
                  </Flex>
                </button>
              </Card>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Status bar */}
      <Separator size="4" />
      <Flex align="center" gap="3" flexShrink="0" px="4" py="2">
        <Text size="1" color="gray">
          {t('common:app.title')}
        </Text>
        <Text size="1" color="gray" aria-hidden>
          ·
        </Text>
        <Text size="1" color="gray">
          v {packageJson.version}
        </Text>
        <Box flexGrow="1" />
        <PreferencesPopover>
          <Button variant="soft" size="2" color="gray">
            <Icon name="settings" size={16} />
            {t('common:statusBar.preferences')}
          </Button>
        </PreferencesPopover>
      </Flex>

      <NewTreeModal open={newTreeOpen} onOpenChange={setNewTreeOpen} />
      <ImportGedcomModal open={importOpen} onOpenChange={setImportOpen} />
      <DownloadTreeModal
        tree={exportingTree}
        open={exportingTree !== null}
        onOpenChange={(next) => {
          if (!next) setExportingTree(null);
        }}
      />
      <DeleteTreeModal
        tree={deletingTree}
        open={deletingTree !== null}
        onOpenChange={(next) => {
          if (!next) setDeletingTree(null);
        }}
      />
      {editingTree && (
        <EditTreeModal
          tree={editingTree}
          open={true}
          onOpenChange={(next) => {
            if (!next) setEditingTree(null);
          }}
        />
      )}
    </Flex>
  );
}
