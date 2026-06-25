import { createFileRoute } from '@tanstack/react-router';
import PricingPage from './-page';

export const Route = createFileRoute('/_main/workloads/pricing/')({
  component: PricingPage,
});