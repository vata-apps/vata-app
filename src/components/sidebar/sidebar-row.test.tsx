import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarRow } from './sidebar-row';

// Replace @tanstack/react-router's Link with a plain anchor for unit testing.
// SidebarRow behaviour under test: href construction, aria-current, chevron,
// and compound subcomponent rendering — none of which need a live router.
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    children,
    ...rest
  }: {
    to?: string;
    params?: Record<string, string>;
    children?: React.ReactNode;
    [k: string]: unknown;
  }) => {
    const href = to ? to.replace(/\$(\w+)/g, (_, k: string) => String(params?.[k] ?? k)) : '#';
    return (
      <a href={href} {...(rest as React.HTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  },
}));

const DEFAULT_PROPS = {
  to: '/tree/$treeId/individual/$individualId' as const,
  params: { treeId: 'tree1', individualId: 'I-0001' },
  selected: false,
} as const;

describe('SidebarRow', () => {
  describe('link target', () => {
    it('renders a link with the href resolved from to + params', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Name>John Smith</SidebarRow.Name>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).toHaveAttribute('href', '/tree/tree1/individual/I-0001');
    });
  });

  describe('aria-current', () => {
    it('sets aria-current="page" when selected', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS} selected={true}>
          <SidebarRow.Name>Jane Doe</SidebarRow.Name>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
    });

    it('omits aria-current when not selected', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS} selected={false}>
          <SidebarRow.Name>Jane Doe</SidebarRow.Name>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
    });
  });

  describe('chevron', () => {
    it('renders the chevron icon inside the link', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Name>Test</SidebarRow.Name>
        </SidebarRow>
      );
      const link = screen.getByRole('link');
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('compound subcomponents', () => {
    it('SidebarRow.Name renders its text content in the link', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Name>Alice Wonderland</SidebarRow.Name>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).toHaveTextContent('Alice Wonderland');
    });

    it('SidebarRow.Meta renders its text content in the link', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Name>Test</SidebarRow.Name>
          <SidebarRow.Meta>1900 — 1970</SidebarRow.Meta>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).toHaveTextContent('1900 — 1970');
    });

    it('SidebarRow.Eyebrow renders its text content in the link', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Eyebrow>BIRTH</SidebarRow.Eyebrow>
          <SidebarRow.Name>Test</SidebarRow.Name>
        </SidebarRow>
      );
      expect(screen.getByRole('link')).toHaveTextContent('BIRTH');
    });

    it('renders multiple subcomponents together in the link', () => {
      render(
        <SidebarRow {...DEFAULT_PROPS}>
          <SidebarRow.Eyebrow>BIRTH</SidebarRow.Eyebrow>
          <SidebarRow.Name>Bob Builder</SidebarRow.Name>
          <SidebarRow.Meta>London</SidebarRow.Meta>
        </SidebarRow>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('BIRTH');
      expect(link).toHaveTextContent('Bob Builder');
      expect(link).toHaveTextContent('London');
    });
  });
});
