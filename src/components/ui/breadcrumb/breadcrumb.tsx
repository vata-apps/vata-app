import { Link, useMatches } from '@tanstack/react-router';
import * as styles from './breadcrumb.css';
import { Fragment } from 'react/jsx-runtime';

export function Breadcrumb() {
  const matches = useMatches();

  const breadcrumb = matches
    .filter((match) => match.loaderData?.breadcrumb)
    .map((match) => ({
      label: match.loaderData?.breadcrumb.label,
      pathname: match.pathname,
    }));

  return (
    <div className={styles.root}>
      {breadcrumb.map((item, index) => {
        if (!item || !item.label) return null;

        const isLast = breadcrumb.length === index + 1;

        if (!isLast) {
          return (
            <Fragment key={item.pathname}>
              <Link className={styles.link} to={item.pathname}>
                {item.label}
              </Link>
              {!isLast && '/'}
            </Fragment>
          );
        }

        return (
          <Fragment key={item.pathname}>
            <span className={styles.item}>{item.label}</span>
            {!isLast && '/'}
          </Fragment>
        );
      })}
    </div>
  );
}
