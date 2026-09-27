import { type ReactNode } from 'react';

import { props } from '@stylexjs/stylex';
import { TreeHeader } from './tree-header/tree-header';
import { TreeNav } from './tree-nav/tree-nav';
import { styles } from './tree-shell.styles';

export interface TreeShellProps {
  children: ReactNode;
}

export function TreeShell({ children }: TreeShellProps): JSX.Element {
  return (
    <div {...props(styles.root)}>
      <TreeNav />

      <div {...props(styles.body)}>
        <TreeHeader />

        <main {...props(styles.main)}>{children}</main>
      </div>
    </div>
  );
}
