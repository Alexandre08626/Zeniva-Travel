'use client';

import dynamic from 'next/dynamic';

const CreateTravelerProfileContent = dynamic(
  () => import('./CreateTravelerProfileContent'),
  { ssr: false }
);

export default function CreateTravelerProfilePage() {
  return <CreateTravelerProfileContent />;
}
