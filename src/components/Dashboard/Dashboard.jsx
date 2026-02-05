'use client';

import { useSession } from 'next-auth/react';
import ProfileEdit from './profile/ProfileEdit';
import { useTranslation } from 'l_i18n';
import ProfileSkeleton from './skeletons/ProfileSkeleton';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (!session) {
    return <p>{t('common.pleaseSignIn', 'Please sign in')}</p>;
  }

  return (
    <div className="p-4">
      <ProfileEdit/>
    </div>
  );
}
