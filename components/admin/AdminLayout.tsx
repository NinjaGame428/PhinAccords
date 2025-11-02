"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard,
  Music, 
  Users, 
  BarChart3, 
  Settings,
  FileText,
  Mail,
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  Activity,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load components for better performance
const Navbar = dynamic(() => import("@/components/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false,
  loading: () => <div className="h-16 bg-background/50 backdrop-blur-sm border-b" />
});

interface AdminLayoutProps {
  children: React.ReactNode;
}


export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Translated navigation items
  const adminNavigationItems = [
    {
      name: t('admin.common.dashboard'),
      href: "/admin",
      icon: LayoutDashboard,
      description: "Admin overview and statistics"
    },
    {
      name: t('admin.common.songs'),
      href: "/admin/songs",
      icon: Music,
      description: "Manage song library"
    },
    {
      name: t('admin.common.artists'),
      href: "/admin/artists",
      icon: Users,
      description: "Artist management"
    },
    {
      name: t('admin.common.users'),
      href: "/admin/users",
      icon: Shield,
      description: "User management"
    },
    {
      name: t('admin.common.resources'),
      href: "/admin/resources",
      icon: BookOpen,
      description: "Learning resources"
    },
    {
      name: t('admin.common.analytics'),
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Site analytics and reports"
    },
    {
      name: t('admin.common.settings'),
      href: "/admin/settings",
      icon: Settings,
      description: "Application settings"
    }
  ];

  const adminQuickActions = [
    {
      name: t('admin.common.addSong'),
      href: "/admin/songs",
      icon: Music,
      description: "Add new song to collection"
    },
    {
      name: t('admin.common.viewAnalytics'),
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Check site performance"
    }
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-black/50" />
          </div>
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full lg:h-screen">
            {/* Sidebar Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-semibold">{t('admin.common.adminPanel')}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* User Info */}
              <div className="mt-4 flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {(user.firstName || 'A')[0]}{(user.lastName || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <nav className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t('admin.common.administration')}
                  </div>
                  {adminNavigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="my-6" />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t('admin.common.quickActions')}
                  </div>
                  {adminQuickActions.map((action) => {
                    const Icon = action.icon;
                    
                    return (
                      <Link
                        key={action.name}
                        href={action.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{action.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                {/* Admin Stats */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t('admin.common.adminStats')}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.common.adminSince')}</span>
                      <Badge variant="secondary" className="text-xs">
                        {user.joinDate && !isNaN(new Date(user.joinDate).getTime()) 
                          ? new Date(user.joinDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.common.accessLevel')}</span>
                      <Badge variant="outline" className="text-xs">
                        {t('admin.common.fullAccess')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('admin.common.signOut')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-background border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">{t('admin.common.adminPanel')}</h1>
              <div className="w-8" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Page Content */}
          <div className="min-h-screen pt-[80px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
