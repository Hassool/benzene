import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Providers from './providers';
import DashNav from '@/components/Dashboard/DashNav';

export default async function Layout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user && !session.user.isActive) {
    redirect('/auth/signin?error=AccountInactive');
  }

  return (
      <div className="__variable_5cfdac __variable_9a8899 bg-bg dark:bg-bg-dark antialiased">
        <Providers session={session}>
          <DashNav/>
          <main className="md:mt-24 mt-4">{children}</main>
        </Providers>
      </div>
  );
}
