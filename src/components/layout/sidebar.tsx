'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  Server,
  Database,
  FolderTree,
  Users,
  Settings,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Activity,
  HardDrive,
  Terminal,
  Network,
  Clock,
  Lock,
  FileCode,
  Menu,
  X,
  Palette,
  BookOpen,
  Rocket,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number;
  children?: NavItem[];
  group?: string;
  roles?: string[];
}

const navigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'hosting',
    label: 'Hosting',
    icon: Globe,
    group: 'hosting',
    children: [
      { id: 'domains', label: 'Domains', icon: Network },
      { id: 'websites', label: 'Websites', icon: Globe },
      { id: 'ssl', label: 'SSL Certificates', icon: Lock },
      { id: 'deployments', label: 'Deployments', icon: Zap },
      { id: 'tunnels', label: 'Cloudflare Tunnels', icon: Server, roles: ['superadmin'] },
    ],
  },
  {
    id: 'server',
    label: 'Server',
    icon: Server,
    group: 'server',
    roles: ['superadmin'],
    children: [
      { id: 'nginx', label: 'Nginx', icon: Server },
      { id: 'php-fpm', label: 'PHP-FPM', icon: FileCode },
      { id: 'pm2', label: 'PM2 Manager', icon: Activity },
      { id: 'cron', label: 'Cron Jobs', icon: Clock },
    ],
  },
  {
    id: 'database',
    label: 'Databases',
    icon: Database,
    badge: '3',
  },
  {
    id: 'files',
    label: 'File Manager',
    icon: FolderTree,
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    group: 'monitoring',
    roles: ['superadmin'],
    children: [
      { id: 'metrics', label: 'Server Metrics', icon: HardDrive },
      { id: 'logs', label: 'Logs', icon: Terminal },
      { id: 'alerts', label: 'Alerts', icon: Shield },
    ],
  },
  {
    id: 'students',
    label: 'User Management',
    icon: Users,
    badge: '12',
    roles: ['superadmin', 'admin'],
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    badge: 'Beta',
  },
  {
    id: 'tutor',
    label: 'Tutorial & Bantuan',
    icon: BookOpen,
  },
  {
    id: 'seo',
    label: 'SEO Tools',
    icon: Search,
    badge: 'New',
  },
  {
    id: 'apps',
    label: 'App Installer',
    icon: Rocket,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['superadmin']
  },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { isCollapsed, expandedGroups, toggle, toggleGroup } = useSidebarStore();
  const { mockRole } = useAuthStore();

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.group || item.id);
    const Icon = item.icon;

    if (item.roles && !item.roles.includes(mockRole)) {
      return null;
    }

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleGroup(item.group || item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
          className={cn(
            'sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5',
            depth > 0 && 'ml-4 text-xs py-2',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5 flex-shrink-0',
              isActive ? 'text-blue-400' : 'text-gray-500'
            )}
          />

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 text-left whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {!isCollapsed && item.badge && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                item.badge === 'Beta'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              )}
            >
              {item.badge}
            </span>
          )}

          {!isCollapsed && hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {!isCollapsed && hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1 pl-2 border-l border-gray-700/50 ml-4">
                {item.children!.map((child) => renderNavItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#0a0c10]/95 backdrop-blur-xl border-r border-blue-500/10 z-50 flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-blue-500/10">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
          >
            <Palette className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 to-violet-500/30 animate-pulse" />
          </motion.div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-bold text-white text-lg tracking-tight">
                  COLES
                </span>
                <span className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">
                  Control Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation
          .filter(item => !item.roles || item.roles.includes(mockRole))
          .map((item) => {
            // Filter children if any based on role
            const filteredItem = { ...item };
            if (filteredItem.children) {
              filteredItem.children = filteredItem.children.filter(
                child => !child.roles || child.roles.includes(mockRole)
              );
            }
            return renderNavItem(filteredItem);
          })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-blue-500/10">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <>
              <X className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile Mini */}
      <div className="p-3 border-t border-blue-500/10">
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors cursor-pointer',
          isCollapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            {mockRole === 'superadmin' ? 'SA' : mockRole === 'admin' ? 'A' : mockRole === 'user' ? 'U' : 'S'}
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm text-white font-medium capitalize">{mockRole}</span>
                <span className="text-xs text-green-400">● Online</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
