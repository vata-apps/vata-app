import { Link, LinkComponentProps, useMatches } from '@tanstack/react-router';
import * as styles from './breadcrumb.css';

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
        console.log({ length: breadcrumb.length, index });
        if (!item) return null;

        if (item.route) {
          console.log(item.route);
          return (
            <>
              <Link className={styles.link} key={item.label} {...item.route}>
                {item.label}
              </Link>
              {breadcrumb.length !== index + 1 && '/'}
            </>
          );
        }

        return (
          <>
            <span className={styles.item} key={item.label}>
              {item.label}
            </span>
            {breadcrumb.length !== index + 1 && '/'}
          </>
        );
      })}
    </div>
  );
}
