import { createFileRoute } from '@tanstack/react-router';
import { HomeRadixPage } from '$/pages/HomeRadixPage';

export const Route = createFileRoute('/home-radix')({
  component: HomeRadixPage,
});
