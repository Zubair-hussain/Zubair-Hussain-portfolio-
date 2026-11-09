import type { Metadata } from 'next';
import CreativeServicePage, { creativeServiceMetadata } from '@/components/services/CreativeServicePage';
import GraphicDesignDesign from '@/components/services/GraphicDesignDesign';
import { GRAPHIC_DESIGN } from '@/lib/creative-services';

export const dynamic = 'force-static';
export const revalidate = false;

export function generateMetadata(): Metadata {
  return creativeServiceMetadata(GRAPHIC_DESIGN);
}

export default function Page() {
  return <CreativeServicePage service={GRAPHIC_DESIGN} design={<GraphicDesignDesign />} />;
}
