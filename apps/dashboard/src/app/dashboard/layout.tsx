'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  Truck,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Filter,
  Download,
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', href: '/dashboard/crm', icon: Users },
  { name: 'Leads', href: '/dashboard/leads', icon: Target },
  { name: 'Contractors', href: '/dashboard/contractors', icon: Truck },
  { name: 'Projets', href: '/dashboard/projects', icon: Building2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

const userMenuItems = [
  { name: 'Profil', href: '/dashboard/settings/profile', icon: User },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  { name: 'Déconnexion', href: '#', icon: LogOut },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zenicorp-lightGray">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zenicorp-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-zenicorp-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zenicorp-black rounded-none flex items-center justify-center">
                <span className="text-zenicorp-gold font-heading font-bold text-lg">Z</span>
              </div>
              <span className="font-heading font-bold text-xl text-zenicorp-black">Zenitech</span>
            </Link>
            <button
              className="lg:hidden p-2 text-zenicorp-mediumGray hover:text-zenicorp-black"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-zenicorp-black text-white'
                      : 'text-zenicorp-mediumGray hover:bg-zenicorp-lightGray hover:text-zenicorp-black'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-3 border-t border-zenicorp-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-zenicorp-gold rounded-full flex items-center justify-center">
                <span className="text-zenicorp-black font-semibold text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zenicorp-black truncate">Alexandre Dubois</p>
                <p className="text-xs text-zenicorp-silver">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-zenicorp-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-zenicorp-mediumGray hover:text-zenicorp-black hover:bg-zenicorp-lightGray rounded-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block">
                <h1 className="heading-3">{getPageTitle(pathname)}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-zenicorp-mediumGray hover:text-zenicorp-black hover:bg-zenicorp-lightGray rounded-none">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 text-zenicorp-mediumGray hover:text-zenicorp-black hover:bg-zenicorp-lightGray rounded-none"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-zenicorp-gold rounded-full flex items-center justify-center">
                    <span className="text-zenicorp-black font-semibold text-sm">AD</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-zenicorp-black">Alexandre</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-zenicorp-border shadow-lg rounded-none py-1 z-50">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zenicorp-mediumGray hover:bg-zenicorp-lightGray hover:text-zenicorp-black"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/dashboard/crm': 'CRM - Pipeline',
    '/dashboard/leads': 'Gestion des leads',
    '/dashboard/contractors': 'Réseau entrepreneurs',
    '/dashboard/projects': 'Gestion de projets',
    '/dashboard/analytics': 'Analytics & Rapports',
    '/dashboard/settings': 'Paramètres',
  };
  for (const [path, title] of Object.entries(titles)) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'Zenitech';
}