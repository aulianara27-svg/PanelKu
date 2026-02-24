'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useSidebarStore, useAuthStore } from '@/lib/store';
import { Dashboard } from '@/components/coles/dashboard';
import { Websites } from '@/components/coles/websites';
import { DatabaseManager } from '@/components/coles/database-manager';
import { FileManager } from '@/components/coles/file-manager';
import { AIAssistant } from '@/components/coles/ai-assistant';
import { StudentManagement } from '@/components/coles/student-management';
import { ServerControl } from '@/components/coles/server-control';
import { Domains } from '@/components/coles/domains';
import { SSLManager } from '@/components/coles/ssl';
import { Deployments } from '@/components/coles/deployments';
import { CloudflareTunnels } from '@/components/coles/cloudflare-tunnels';
import { LoginForm } from '@/components/coles/login-form';
import { Globe, Shield, Zap } from 'lucide-react';

export default function ColesControlPanel() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const { isAuthenticated } = useAuthStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({
    cpu: 42,
    memory: 45,
    disk: 38,
  });

  const updateSystemStatus = useCallback(() => {
    setSystemStatus({
      cpu: Math.floor(Math.random() * 30) + 35,
      memory: Math.floor(Math.random() * 20) + 40,
      disk: Math.floor(Math.random() * 10) + 35,
    });
  }, []);

  useEffect(() => {
    // Simulate real-time system stats
    const interval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(interval);
  }, [updateSystemStatus]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'websites':
        return <Websites />;
      case 'domains':
        return <Domains />;
      case 'ssl':
        return <SSLManager />;
      case 'deployments':
        return <Deployments />;
      case 'tunnels':
        return <CloudflareTunnels />;
      case 'database':
        return <DatabaseManager />;
      case 'files':
        return <FileManager />;
      case 'tutor':
        return <AIAssistant initialQuery="Tolong berikan saya tutorial cara menggunakan COLES CONTROL Panel ini dari awal hingga akhir." />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'students':
        return <StudentManagement />;
      case 'nginx':
      case 'php-fpm':
      case 'pm2':
      case 'cron':
        return <ServerControl />;
      case 'metrics':
      case 'logs':
      case 'alerts':
        return <Dashboard />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
              <p className="text-gray-500">System settings coming soon...</p>
            </div>
          </div>
        );
      default:
        return null; // or an animated 404/not found component
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen flex bg-[#0f1115] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 72 : 260 }}
      >
        {/* Header */}
        <Header activeSection={activeSection} systemStatus={systemStatus} onOpenAI={() => setActiveSection('ai-assistant')} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-blue-500/10 bg-[#0f1115]/80 backdrop-blur-xl p-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>COLES CONTROL v1.0.0</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <span>Server: coles.id</span>
              <span>•</span>
              <span>Uptime: 10d 5h 32m</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
