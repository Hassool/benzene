'use client';

import { useSession } from 'next-auth/react';
import ProfileEdit from './profile/ProfileEdit';
import { useTranslation } from 'l_i18n';

export default function Dashboard() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  if (!session) {
    return <p>{t('common.loading', 'Loading...')}</p>;
  }

  return (
    <div className="p-4">
      <ProfileEdit/>
    </div>
  );
}
