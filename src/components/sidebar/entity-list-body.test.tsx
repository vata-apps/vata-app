import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityListBody } from './entity-list-body';

const SKELETON = <div>skeleton-item</div>;
const CHILDREN = <div>ready-content</div>;

const BASE_PROPS = {
  skeletonRow: SKELETON,
  emptyIcon: 'user' as const,
  emptyMessage: 'No items here',
  errorMessage: 'Failed to load',
};

describe('EntityListBody', () => {
  describe('status: loading', () => {
    it('renders skeletonRow repeated skeletonCount times', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="loading" skeletonCount={3}>
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.getAllByText('skeleton-item')).toHaveLength(3);
    });

    it('defaults skeletonCount to 7', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="loading">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.getAllByText('skeleton-item')).toHaveLength(7);
    });

    it('does not render children', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="loading">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('ready-content')).not.toBeInTheDocument();
    });

    it('does not render empty or error messages', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="loading">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('No items here')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
    });
  });

  describe('status: error', () => {
    it('renders the error message', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="error">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('does not render children or skeleton', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="error">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('ready-content')).not.toBeInTheDocument();
      expect(screen.queryByText('skeleton-item')).not.toBeInTheDocument();
    });

    it('does not render the empty message', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="error">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('No items here')).not.toBeInTheDocument();
    });
  });

  describe('status: empty', () => {
    it('renders the empty message', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="empty">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.getByText('No items here')).toBeInTheDocument();
    });

    it('renders an icon in the empty state', () => {
      const { container } = render(
        <EntityListBody {...BASE_PROPS} status="empty">
          {CHILDREN}
        </EntityListBody>
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render children or skeleton', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="empty">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('ready-content')).not.toBeInTheDocument();
      expect(screen.queryByText('skeleton-item')).not.toBeInTheDocument();
    });

    it('does not render the error message', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="empty">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
    });
  });

  describe('status: ready', () => {
    it('renders children', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="ready">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.getByText('ready-content')).toBeInTheDocument();
    });

    it('does not render skeleton', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="ready">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('skeleton-item')).not.toBeInTheDocument();
    });

    it('does not render empty or error messages', () => {
      render(
        <EntityListBody {...BASE_PROPS} status="ready">
          {CHILDREN}
        </EntityListBody>
      );
      expect(screen.queryByText('No items here')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
    });
  });
});
