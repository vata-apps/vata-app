import { Link, LinkComponentProps, useMatches } from '@tanstack/react-router';
import * as styles from './breadcrumb.css';
import { Fragment } from 'react/jsx-runtime';

export interface BreadcrumpLoaderData {
  breadcrumb: { label: string; route: LinkComponentProps | null }[];
}

export function Breadcrumb() {
  const matches = useMatches();

  const breadcrumb = matches
    .filter((match) => match.loaderData?.breadcrumb)
    .flatMap((match) => match.loaderData?.breadcrumb);

  return (
    <div className={styles.root}>
      {breadcrumb.map((item, index) => {
        if (!item) return null;

        if (item.route) {
          return (
            <Fragment key={item.label}>
              <Link className={styles.link} {...item.route}>
                {item.label}
              </Link>
              {breadcrumb.length !== index + 1 && '/'}
            </Fragment>
          );
        }

        return (
          <Fragment key={item.label}>
            <span className={styles.item}>{item.label}</span>
            {breadcrumb.length !== index + 1 && '/'}
          </Fragment>
        );
      })}
    </div>
  );
}
