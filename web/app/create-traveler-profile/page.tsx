import dynamic from 'next/dynamic';

const TravelerProfileForm = dynamic(() => import('./TravelerProfileForm'), { ssr: false });

export default function CreateTravelerProfilePage() {
  return <TravelerProfileForm />;
}
