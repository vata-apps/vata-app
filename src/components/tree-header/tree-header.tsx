import * as styles from './tree-header.css';
import { Breadcrumb } from '../ui/breadcrumb/breadcrumb';

export function TreeHeader(): JSX.Element {
  return (
    <header className={styles.root}>
      <Breadcrumb />

      <div className={styles.actions}>
        <div>Search Input</div>
        <div>Update Button</div>
        <div>Create Button</div>
      </div>
    </header>
  );
}
