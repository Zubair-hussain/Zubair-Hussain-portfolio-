import type { Metadata } from 'next';
import CreativeServicePage, { creativeServiceMetadata } from '@/components/services/CreativeServicePage';
import WebDevelopmentDesign from '@/components/services/WebDevelopmentDesign';
import { WEB_DEVELOPMENT } from '@/lib/creative-services';

export const dynamic = 'force-static';
export const revalidate = false;

export function generateMetadata(): Metadata {
  return creativeServiceMetadata(WEB_DEVELOPMENT);
}

export default function Page() {
  return <CreativeServicePage service={WEB_DEVELOPMENT} design={<WebDevelopmentDesign service={WEB_DEVELOPMENT} />} />;
}
