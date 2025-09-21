'use client';

import { useSession } from 'next-auth/react';
import ProfileEdit from './profile/ProfileEdit';

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <ProfileEdit/>
    </div>
  );
}
