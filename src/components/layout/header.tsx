'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Command,
  Sparkles,
  Server,
  Activity,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  activeSection: string;
  systemStatus: {
    cpu: number;
    memory: number;
    disk: number;
  };
  onOpenAI?: () => void;
}

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  domains: 'Domain Management',
  websites: 'Website Management',
  ssl: 'SSL Certificates',
  deployments: 'Deployment History',
  tunnels: 'Tunnels & Expose',
  nginx: 'Nginx Configuration',
  'php-fpm': 'PHP-FPM Settings',
  pm2: 'PM2 Process Manager',
  cron: 'Cron Job Scheduler',
  database: 'Database Manager',
  files: 'File Manager',
  metrics: 'Server Metrics',
  logs: 'System Logs',
  alerts: 'Alert Center',
  students: 'Student Management',
  'ai-assistant': 'AI Assistant',
  settings: 'System Settings',
};

export function Header({ activeSection, systemStatus, onOpenAI }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { mockRole, setMockRole, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0f1115]/80 backdrop-blur-xl border-b border-blue-500/10">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        {/* Left Section - Title & Status */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-xl font-semibold text-white truncate">
              {sectionTitles[activeSection] || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 truncate hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* System Status Pills */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                systemStatus.cpu > 80 ? 'bg-red-500 animate-pulse' :
                  systemStatus.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
              )} />
              <span className="text-xs text-gray-400">CPU</span>
              <span className="text-xs font-mono text-white">{systemStatus.cpu}%</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                systemStatus.memory > 80 ? 'bg-red-500 animate-pulse' :
                  systemStatus.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
              )} />
              <span className="text-xs text-gray-400">RAM</span>
              <span className="text-xs font-mono text-white">{systemStatus.memory}%</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                systemStatus.disk > 80 ? 'bg-red-500 animate-pulse' :
                  systemStatus.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
              )} />
              <span className="text-xs text-gray-400">Disk</span>
              <span className="text-xs font-mono text-white">{systemStatus.disk}%</span>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <motion.div
            initial={false}
            animate={{ width: searchOpen ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '140px' : '200px') : '36px' }}
            className="relative flex items-center h-9 bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-colors focus-within:border-blue-500/50 focus-within:bg-white/10 hover:bg-white/10"
            onMouseEnter={() => setSearchOpen(true)}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.currentTarget.querySelector('input')) {
                setSearchOpen(false);
              }
            }}
          >
            <div className="w-[36px] h-9 shrink-0 flex items-center justify-center text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className={cn(
                "flex-1 h-full bg-transparent border-0 text-sm text-white focus:outline-none px-2 placeholder:text-gray-500 min-w-0 transition-opacity",
                searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onFocus={() => setSearchOpen(true)}
              onBlur={(e) => {
                if (!e.target.value) setSearchOpen(false);
              }}
            />
            <div className={cn(
              "shrink-0 pr-2 flex items-center transition-opacity duration-200",
              searchOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden md:flex"
            )}>
              <kbd className="items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-400 font-mono hidden md:flex">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </motion.div>

          {/* AI Assistant Quick Access */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onOpenAI}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/25"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Ask AI</span>
            </Button>
          </motion.div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#0a0c10] border-blue-500/20">
              <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-white font-medium">High CPU Usage</span>
                </div>
                <span className="text-xs text-gray-500">Server CPU reached 92%</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-white font-medium">SSL Certificate Renewed</span>
                </div>
                <span className="text-xs text-gray-500">coles.id SSL renewed successfully</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-white font-medium">New Student Registration</span>
                </div>
                <span className="text-xs text-gray-500">budi123 registered a new website</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu / Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {mockRole === 'superadmin' ? 'SA' : mockRole === 'admin' ? 'A' : 'S'}
                </div>
                <span className="hidden sm:block text-sm text-white capitalize">{mockRole}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0a0c10] border-blue-500/20">
              <DropdownMenuLabel className="text-white">
                <div className="flex flex-col">
                  <span className="capitalize">{mockRole} Panel</span>
                  <span className="text-xs font-normal text-gray-500">Test RBAC Modes</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                onClick={() => setMockRole('superadmin')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Switch to SuperAdmin
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                onClick={() => setMockRole('admin')}
              >
                <User className="w-4 h-4 mr-2" />
                Switch to Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                onClick={() => setMockRole('student')}
              >
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-400">Switch to Student</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
