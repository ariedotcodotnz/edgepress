import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Image, BarChart2, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/useAuth';
const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
    isActive && 'bg-muted text-primary'
  );
export function AdminSidebar() {
  const { logout } = useAuth();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/admin/media" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6" />
            <span className="">EdgePress CMS</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink to="/admin/media" end className={navLinkClasses}>
              <Home className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/media/press-releases" className={navLinkClasses}>
              <FileText className="h-4 w-4" />
              Press Releases
            </NavLink>
            <NavLink to="/admin/media/pages" className={navLinkClasses}>
              <Image className="h-4 w-4" />
              Static Pages
            </NavLink>
            <NavLink to="/admin/media/analytics" className={navLinkClasses}>
              <BarChart2 className="h-4 w-4" />
              Analytics
            </NavLink>
            <NavLink to="/admin/media/users" className={navLinkClasses}>
              <Users className="h-4 w-4" />
              Users
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4">
            <Button size="sm" variant="outline" className="w-full justify-start gap-3" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </div>
      </div>
    </div>
  );
}