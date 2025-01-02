import { getUserSession } from '@/actions/auth';
import { Sidebar } from './sidebar';

export async function SidebarContainer() {
  const user = await getUserSession();
  return <Sidebar userRole={user?.role ?? null} />;
}
