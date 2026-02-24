'use client';

import { motion } from 'framer-motion';
import {
  Server,
  Play,
  Square,
  RotateCcw,
  Settings,
  FileText,
  Activity,
  Terminal,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu,
  MemoryStick,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  displayName: string;
  status: 'running' | 'stopped' | 'error';
  version: string;
  port: number | null;
  cpuUsage: number;
  memUsage: number;
  uptime: number;
  lastRestart: Date | null;
  configPath: string;
  logPath: string;
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export function ServerControl() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      const parsedData = data.services.map((d: any) => ({
        ...d,
        lastRestart: d.lastRestart ? new Date(d.lastRestart) : null
      }));
      setServices(parsedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch services status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    // Optimistic Update
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          status: action === 'stop' ? 'stopped' : 'running',
          uptime: action === 'restart' ? 0 : s.uptime,
          lastRestart: action === 'restart' ? new Date() : s.lastRestart,
        };
      }
      return s;
    }));
    toast({
      title: 'Action Sent',
      description: `Executing sudo systemctl ${action} ${serviceId}`,
    });

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('API Error');

      const parsedData = data.services.map((d: any) => ({
        ...d,
        lastRestart: d.lastRestart ? new Date(d.lastRestart) : null
      }));
      setServices(parsedData);
    } catch (err) {
      toast({ title: 'System Error', description: 'Action failed to reach daemon', variant: 'destructive' });
      fetchServices(); // revert status
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Service Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Running', value: services.filter(s => s.status === 'running').length, color: 'green' },
          { label: 'Stopped', value: services.filter(s => s.status === 'stopped').length, color: 'red' },
          { label: 'Total CPU', value: `${services.reduce((a, s) => a + s.cpuUsage, 0).toFixed(1)}%`, color: 'blue' },
          { label: 'Total RAM', value: `${(services.reduce((a, s) => a + s.memUsage, 0) / 1024).toFixed(2)} GB`, color: 'violet' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={cn(
              'text-2xl font-bold',
              stat.color === 'blue' && 'text-blue-400',
              stat.color === 'green' && 'text-green-400',
              stat.color === 'red' && 'text-red-400',
              stat.color === 'violet' && 'text-violet-400'
            )}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className={cn(
              'glass-card rounded-xl p-5 cursor-pointer transition-all',
              selectedService?.id === service.id && 'ring-2 ring-blue-500/50'
            )}
            onClick={() => setSelectedService(service)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  service.status === 'running'
                    ? 'bg-green-500/20 text-green-400'
                    : service.status === 'stopped'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{service.displayName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">v{service.version}</span>
                    {service.port && (
                      <span className="text-xs text-blue-400">:{service.port}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  service.status === 'running' && 'bg-green-500 animate-pulse',
                  service.status === 'stopped' && 'bg-red-500',
                  service.status === 'error' && 'bg-yellow-500 animate-pulse'
                )} />
                <Badge
                  variant="outline"
                  className={cn(
                    service.status === 'running' && 'border-green-500/30 text-green-400',
                    service.status === 'stopped' && 'border-red-500/30 text-red-400',
                    service.status === 'error' && 'border-yellow-500/30 text-yellow-400'
                  )}
                >
                  {service.status}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-gray-500">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={service.cpuUsage} className="flex-1 h-1" />
                  <span className="text-xs text-white">{service.cpuUsage}%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MemoryStick className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-gray-500">Memory</span>
                </div>
                <span className="text-sm text-white">{service.memUsage} MB</span>
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Uptime: {formatUptime(service.uptime)}
              </span>
              {service.lastRestart && (
                <span>Last restart: {service.lastRestart.toLocaleDateString()}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              {service.status === 'running' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5"
                    onClick={(e) => { e.stopPropagation(); handleServiceAction(service.id, 'restart'); }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={(e) => { e.stopPropagation(); handleServiceAction(service.id, 'stop'); }}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-500 text-white"
                  onClick={(e) => { e.stopPropagation(); handleServiceAction(service.id, 'start'); }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:bg-white/5"
              >
                <Settings className="w-4 h-4 mr-1" />
                Config
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:bg-white/5"
              >
                <FileText className="w-4 h-4 mr-1" />
                Logs
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Service Details */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            {selectedService.displayName} - Quick Actions
          </h3>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="config" className="data-[state=active]:bg-blue-600">Config</TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-blue-600">Logs</TabsTrigger>
              <TabsTrigger value="commands" className="data-[state=active]:bg-blue-600">Commands</TabsTrigger>
            </TabsList>
            <TabsContent value="config" className="mt-4">
              <div className="terminal">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">{selectedService.configPath}</span>
                </div>
                <div className="terminal-body font-mono text-sm">
                  <pre className="text-gray-300">
                    {`# ${selectedService.displayName} Configuration
# Path: ${selectedService.configPath}

server {
    listen ${selectedService.port || 80};
    server_name _;
    
    root /var/www/html;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~ \\.php$ {
        fastcgi_pass unix:/run/php/php${selectedService.id === 'php-fpm' ? '-fpm' : '8.2-fpm'}.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="logs" className="mt-4">
              <div className="terminal">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">{selectedService.logPath}</span>
                </div>
                <div className="terminal-body font-mono text-sm max-h-64 overflow-y-auto">
                  <p className="text-green-400">[{new Date().toISOString()}] Service started successfully</p>
                  <p className="text-gray-400">[{new Date(Date.now() - 60000).toISOString()}] Configuration reloaded</p>
                  <p className="text-blue-400">[{new Date(Date.now() - 120000).toISOString()}] New connection from 192.168.1.1</p>
                  <p className="text-gray-400">[{new Date(Date.now() - 180000).toISOString()}] Request processed in 45ms</p>
                  <p className="text-green-400">[{new Date(Date.now() - 240000).toISOString()}] Health check passed</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="commands" className="mt-4">
              <div className="space-y-3">
                {[
                  { cmd: `sudo systemctl status ${selectedService.name}`, desc: 'Check service status' },
                  { cmd: `sudo systemctl restart ${selectedService.name}`, desc: 'Restart service' },
                  { cmd: `sudo journalctl -u ${selectedService.name} -f`, desc: 'Follow logs' },
                  { cmd: `sudo ${selectedService.name} -t`, desc: 'Test configuration' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <code className="text-sm text-green-400">{item.cmd}</code>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-white/5">
                      <Terminal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
}
