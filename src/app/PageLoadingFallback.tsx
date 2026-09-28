import { Container } from '../components/layout/Container';
import { Skeleton } from '../components/feedback/Skeleton';

/** Shown briefly while a lazy-loaded route chunk downloads. */
export function PageLoadingFallback() {
  return (
    <Container className="flex flex-col gap-4 py-24">
      <Skeleton variant="text" className="h-8 w-1/3" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="block" className="mt-4 h-64 w-full" />
    </Container>
  );
}
