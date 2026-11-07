import type { Metadata } from 'next';
import CreativeServicePage, { creativeServiceMetadata } from '@/components/services/CreativeServicePage';
import VideoEditingDesign from '@/components/services/VideoEditingDesign';
import { VIDEO_EDITING } from '@/lib/creative-services';

export const dynamic = 'force-static';
export const revalidate = false;

export function generateMetadata(): Metadata {
  return creativeServiceMetadata(VIDEO_EDITING);
}

export default function Page() {
  return <CreativeServicePage service={VIDEO_EDITING} design={<VideoEditingDesign />} />;
}
