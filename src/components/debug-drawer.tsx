// DEV-ONLY: This component is only imported inside import.meta.env.DEV guards in callers.

import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Code,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Table,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import packageJson from '../../package.json';
import { Icon } from '$components/icon';
import { getSystemDebugData, type SystemDebugData } from '$db-system/debug';
import { getTreeDebugData, type TreeDebugData } from '$db-tree/debug';
import { useAppStore } from '$/store/app-store';

export interface DebugDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SystemDbTab({ data }: { data: SystemDebugData | null }): JSX.Element {
  if (!data) {
    return (
      <Text color="gray" size="2">
        No system data available.
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Heading size="2" mb="2">
          Trees ({data.trees.length})
        </Heading>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Individuals</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Families</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last Opened</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.trees.length === 0 ? (
              <Table.Row>
                <Table.Cell>
                  <Text color="gray" size="1">
                    No trees found.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.trees.map((tree) => (
                <Table.Row key={tree.id}>
                  <Table.Cell>
                    <Code size="1">{tree.id}</Code>
                  </Table.Cell>
                  <Table.Cell>
                    <Code size="1">{tree.name}</Code>
                  </Table.Cell>
                  <Table.Cell>{tree.individual_count}</Table.Cell>
                  <Table.Cell>{tree.family_count}</Table.Cell>
                  <Table.Cell>
                    <Code size="1">{tree.last_opened_at ?? '—'}</Code>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      <Box>
        <Heading size="2" mb="2">
          App Settings ({Object.keys(data.appSettings).length})
        </Heading>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.keys(data.appSettings).length === 0 ? (
              <Table.Row>
                <Table.Cell>
                  <Text color="gray" size="1">
                    No settings found.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              Object.entries(data.appSettings).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>
                    <Code size="1">{key}</Code>
                  </Table.Cell>
                  <Table.Cell>
                    <Code size="1">{value}</Code>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Flex>
  );
}

function TreeDbTab({
  data,
  error,
}: {
  data: TreeDebugData | null;
  error: string | null;
}): JSX.Element {
  if (error) {
    return (
      <Flex direction="column" gap="2">
        <Badge color="gray" size="1">
          No active tree
        </Badge>
        <Text color="gray" size="2">
          {error}
        </Text>
      </Flex>
    );
  }

  if (!data) {
    return (
      <Text color="gray" size="2">
        No tree data available.
      </Text>
    );
  }

  const countRows: Array<[string, number]> = [
    ['individuals', data.counts.individuals],
    ['names', data.counts.names],
    ['families', data.counts.families],
    ['family_members', data.counts.familyMembers],
    ['events', data.counts.events],
    ['event_participants', data.counts.eventParticipants],
    ['places', data.counts.places],
  ];

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Heading size="2" mb="2">
          Entity Counts
        </Heading>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Table</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Rows</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {countRows.map(([label, count]) => (
              <Table.Row key={label}>
                <Table.Cell>
                  <Code size="1">{label}</Code>
                </Table.Cell>
                <Table.Cell>{count}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {Object.keys(data.meta).length > 0 && (
        <Box>
          <Heading size="2" mb="2">
            Tree Meta
          </Heading>
          <Table.Root variant="surface" size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.entries(data.meta).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>
                    <Code size="1">{key}</Code>
                  </Table.Cell>
                  <Table.Cell>
                    <Code size="1">{value}</Code>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Flex>
  );
}

function I18nTab(): JSX.Element {
  const { i18n } = useTranslation('common');
  const language = i18n.language;
  const resolvedLanguage = i18n.resolvedLanguage ?? language;
  const namespaces = i18n.options.resources
    ? Object.keys(i18n.options.resources[resolvedLanguage] ?? {})
    : [];

  const rows: Array<[string, string]> = [
    ['language', language],
    ['resolvedLanguage', resolvedLanguage],
    ['namespaces', namespaces.join(', ') || '(none)'],
    ['fallbackLng', String(i18n.options.fallbackLng ?? '(not set)')],
  ];

  return (
    <Table.Root variant="surface" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Property</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map(([key, value]) => (
          <Table.Row key={key}>
            <Table.Cell>
              <Code size="1">{key}</Code>
            </Table.Cell>
            <Table.Cell>
              <Code size="1">{value}</Code>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function ThemeTab(): JSX.Element {
  const theme = useAppStore((state) => state.theme);
  const currentTreeId = useAppStore((state) => state.currentTreeId);

  const rows: Array<[string, string]> = [
    ['theme', theme],
    ['currentTreeId', currentTreeId ?? '(none)'],
  ];

  return (
    <Table.Root variant="surface" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map(([key, value]) => (
          <Table.Row key={key}>
            <Table.Cell>
              <Code size="1">{key}</Code>
            </Table.Cell>
            <Table.Cell>
              <Badge size="1">{value}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function BuildTab(): JSX.Element {
  const rows: Array<[string, string]> = [
    ['app.version', packageJson.version],
    ['vite.mode', import.meta.env.MODE],
    ['vite.dev', String(import.meta.env.DEV)],
  ];

  return (
    <Table.Root variant="surface" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Property</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map(([key, value]) => (
          <Table.Row key={key}>
            <Table.Cell>
              <Code size="1">{key}</Code>
            </Table.Cell>
            <Table.Cell>
              <Code size="1">{value}</Code>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export function DebugDrawer({ open, onOpenChange }: DebugDrawerProps): JSX.Element | null {
  const [systemData, setSystemData] = useState<SystemDebugData | null>(null);
  const [treeData, setTreeData] = useState<TreeDebugData | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSystemData(null);
      setTreeData(null);
      setTreeError(null);
      return;
    }

    setLoading(true);

    const loadAll = async () => {
      const [sysResult, treeResult] = await Promise.allSettled([
        getSystemDebugData(),
        getTreeDebugData(),
      ]);

      if (!mountedRef.current) return;

      if (sysResult.status === 'fulfilled') {
        setSystemData(sysResult.value);
      }

      if (treeResult.status === 'fulfilled') {
        setTreeData(treeResult.value);
      } else {
        setTreeError(
          treeResult.reason instanceof Error ? treeResult.reason.message : 'No active tree'
        );
      }

      setLoading(false);
    };

    void loadAll();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <Box
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--black-a6)',
          zIndex: 1000,
        }}
      />
      <Box
        role="dialog"
        aria-modal="true"
        aria-label="Debug panel"
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '720px',
          maxWidth: '90vw',
          zIndex: 1001,
          background: 'var(--color-background)',
          borderLeft: '1px solid var(--gray-a6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Flex
          align="center"
          justify="between"
          px="4"
          py="3"
          style={{ borderBottom: '1px solid var(--gray-a5)', flexShrink: 0 }}
        >
          <Flex align="center" gap="2">
            <Icon name="bug" size={16} />
            <Heading size="3">Debug</Heading>
            <Badge color="orange" size="1">
              DEV
            </Badge>
          </Flex>
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => onOpenChange(false)}
            aria-label="Close debug panel"
          >
            <Icon name="x" size={16} />
          </IconButton>
        </Flex>

        <Tabs.Root
          defaultValue="system"
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <Tabs.List style={{ flexShrink: 0 }}>
            <Tabs.Trigger value="system">System DB</Tabs.Trigger>
            <Tabs.Trigger value="tree">Tree DB</Tabs.Trigger>
            <Tabs.Trigger value="i18n">i18n</Tabs.Trigger>
            <Tabs.Trigger value="theme">Theme</Tabs.Trigger>
            <Tabs.Trigger value="build">Build</Tabs.Trigger>
          </Tabs.List>

          <Box style={{ flex: 1, overflow: 'auto' }}>
            <Box p="4">
              {loading ? (
                <Flex align="center" gap="2" py="4">
                  <Spinner />
                  <Text size="2" color="gray">
                    Loading…
                  </Text>
                </Flex>
              ) : (
                <>
                  <Tabs.Content value="system">
                    <SystemDbTab data={systemData} />
                  </Tabs.Content>
                  <Tabs.Content value="tree">
                    <TreeDbTab data={treeData} error={treeError} />
                  </Tabs.Content>
                  <Tabs.Content value="i18n">
                    <I18nTab />
                  </Tabs.Content>
                  <Tabs.Content value="theme">
                    <ThemeTab />
                  </Tabs.Content>
                  <Tabs.Content value="build">
                    <BuildTab />
                  </Tabs.Content>
                </>
              )}
            </Box>
          </Box>
        </Tabs.Root>
      </Box>
    </>
  );
}
