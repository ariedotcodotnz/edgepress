import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative font-mono text-lg uppercase tracking-wider text-foreground transition-colors hover:text-brutal-yellow',
    'after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-foreground after:transition-transform after:duration-300 after:ease-out',
    isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
  );
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <ThemeToggle className="fixed top-4 right-4" />
      <header className="border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <NavLink to="/" className="text-2xl font-bold font-mono uppercase tracking-widest">
              EdgePress
            </NavLink>
            <nav className="hidden md:flex items-center space-x-10">
              <NavLink to="/" className={navLinkClasses}>
                Home
              </NavLink>
              <NavLink to="/about" className={navLinkClasses}>
                About
              </NavLink>
              <NavLink to="/assets" className={navLinkClasses}>
                Assets
              </NavLink>
              <NavLink to="/contact" className={navLinkClasses}>
                Contact
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="font-mono text-sm">&copy; {new Date().getFullYear()} EdgePress. All rights reserved.</p>
            <p className="font-mono text-sm">Built with ❤️ at Cloudflare</p>
          </div>
        </div>
      </footer>
    </div>
  );
}