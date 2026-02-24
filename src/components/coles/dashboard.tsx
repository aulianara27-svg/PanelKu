'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Database,
  Globe,
  Users,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Cpu as CpuIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useEffect } from 'react';

// Utility for formatting bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Mock data for charts
const cpuData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 62 },
  { time: '12:00', value: 78 },
  { time: '16:00', value: 85 },
  { time: '20:00', value: 56 },
  { time: '24:00', value: 42 },
];

const memoryData = [
  { time: '00:00', value: 2.1 },
  { time: '04:00', value: 2.0 },
  { time: '08:00', value: 2.8 },
  { time: '12:00', value: 3.2 },
  { time: '16:00', value: 3.5 },
  { time: '20:00', value: 3.0 },
  { time: '24:00', value: 2.4 },
];

const networkData = [
  { time: '00:00', in: 120, out: 80 },
  { time: '04:00', in: 90, out: 60 },
  { time: '08:00', in: 350, out: 220 },
  { time: '12:00', in: 520, out: 380 },
  { time: '16:00', in: 680, out: 450 },
  { time: '20:00', in: 420, out: 280 },
  { time: '24:00', in: 180, out: 120 },
];

const serviceDistribution = [
  { name: 'Nginx', value: 35, color: '#3b82f6' },
  { name: 'PHP-FPM', value: 28, color: '#8b5cf6' },
  { name: 'MySQL', value: 22, color: '#10b981' },
  { name: 'Redis', value: 10, color: '#f97316' },
  { name: 'Node.js', value: 5, color: '#06b6d4' },
];

const recentActivities = [
  { id: 1, action: 'SSL certificate renewed', entity: 'coles.id', time: '5 min ago', type: 'success' },
  { id: 2, action: 'New deployment completed', entity: 'student/budi123', time: '15 min ago', type: 'info' },
  { id: 3, action: 'Database backup created', entity: 'production_db', time: '1 hour ago', type: 'info' },
  { id: 4, action: 'High CPU alert triggered', entity: 'Server', time: '2 hours ago', type: 'warning' },
  { id: 5, action: 'New student registered', entity: 'andi456', time: '3 hours ago', type: 'success' },
];

const services = [
  { name: 'Nginx', status: 'running', cpu: 12.5, memory: 256, port: 80 },
  { name: 'PHP-FPM 8.2', status: 'running', cpu: 8.2, memory: 512, port: 9000 },
  { name: 'MySQL', status: 'running', cpu: 15.8, memory: 1024, port: 3306 },
  { name: 'Redis', status: 'running', cpu: 2.1, memory: 128, port: 6379 },
  { name: 'PM2', status: 'running', cpu: 5.4, memory: 384, port: -1 },
];

const stats = [
  {
    label: 'Total Websites',
    value: 47,
    change: +3,
    icon: Globe,
    color: 'blue',
    trend: 'up'
  },
  {
    label: 'Active Students',
    value: 32,
    change: +5,
    icon: Users,
    color: 'green',
    trend: 'up'
  },
  {
    label: 'Databases',
    value: 28,
    change: +1,
    icon: Database,
    color: 'violet',
    trend: 'up'
  },
  {
    label: 'SSL Certificates',
    value: 45,
    change: -2,
    icon: Shield,
    color: 'cyan',
    trend: 'down'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const { mockRole, user } = useAuthStore();
  const isServerAdmin = mockRole === 'superadmin';
  const [userDashboardLoading, setUserDashboardLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (!isServerAdmin && user?.id) {
      setUserDashboardLoading(true);
      fetch(`/api/user/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserStats(data);
          }
          setUserDashboardLoading(false);
        })
        .catch(err => {
          console.error("Failed fetching user dashboard stats:", err);
          setUserDashboardLoading(false);
        });
    }
  }, [isServerAdmin, user?.id]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          // Hide "Active Students" stat from non-admins
          if (!isServerAdmin && stat.label === 'Active Students') return null;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="metric-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={cn(
                  'p-3 rounded-xl',
                  stat.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                  stat.color === 'green' && 'bg-green-500/20 text-green-400',
                  stat.color === 'violet' && 'bg-violet-500/20 text-violet-400',
                  stat.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}
                </span>
                <span className="text-xs text-gray-500">from last week</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      {isServerAdmin ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Chart */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">CPU Usage</h3>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm text-gray-400">Live</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#cpuGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Memory Chart */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Memory Usage</h3>
                  <p className="text-sm text-gray-500">GB allocated</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-violet-400">3.5</span>
                  <span className="text-sm text-gray-500"> / 8 GB</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6, fill: '#a78bfa' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Network & Services Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network Traffic */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Network Traffic</h3>
                  <p className="text-sm text-gray-500">Inbound & Outbound</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded bg-green-500" />
                    <span className="text-gray-400">Inbound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded bg-blue-500" />
                    <span className="text-gray-400">Outbound</span>
                  </div>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={networkData}>
                    <defs>
                      <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="in"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#inGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#outGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Service Distribution */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resource Distribution</h3>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {serviceDistribution.map((service) => (
                  <div key={service.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="text-xs text-gray-400">{service.name}</span>
                    <span className="text-xs text-white ml-auto">{service.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Services & Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Running Services */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Running Services</h3>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All systems operational
                </span>
              </div>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        service.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <div>
                        <span className="text-sm text-white">{service.name}</span>
                        {service.port > 0 && (
                          <span className="text-xs text-gray-500 ml-2">:{service.port}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">
                        <span className="text-blue-400">{service.cpu}%</span> CPU
                      </span>
                      <span className="text-gray-400">
                        <span className="text-violet-400">{service.memory}MB</span> RAM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">View all</button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      activity.type === 'success' && 'bg-green-500/20 text-green-400',
                      activity.type === 'warning' && 'bg-yellow-500/20 text-yellow-400',
                      activity.type === 'info' && 'bg-blue-500/20 text-blue-400',
                    )}>
                      {activity.type === 'success' && <Zap className="w-4 h-4" />}
                      {activity.type === 'warning' && <Activity className="w-4 h-4" />}
                      {activity.type === 'info' && <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="truncate">{activity.entity}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Account Limits</h3>
            {userDashboardLoading ? (
              <div className="flex items-center justify-center p-8 h-48">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : userStats ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Disk Quota</span>
                  <span className="text-white">{formatBytes(userStats.usage.disk)} / {formatBytes(userStats.limits.maxDiskSpace)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((userStats.usage.disk / userStats.limits.maxDiskSpace) * 100, 100)}%` }}></div>
                </div>

                <div className="flex justify-between text-sm pt-4">
                  <span className="text-gray-400">Databases Used</span>
                  <span className="text-white">{userStats.usage.databases} / {userStats.limits.maxDatabases}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((userStats.usage.databases / userStats.limits.maxDatabases) * 100, 100)}%` }}></div>
                </div>

                <div className="flex justify-between text-sm pt-4">
                  <span className="text-gray-400">Bandwidth (Monthly)</span>
                  <span className="text-white">{formatBytes(userStats.usage.bandwidth)} / {formatBytes(userStats.limits.maxBandwidth)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${Math.min((userStats.usage.bandwidth / userStats.limits.maxBandwidth) * 100, 100)}%` }}></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">Gagal mengambil data limit Anda.</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Deployments</h3>
            {!userDashboardLoading && userStats?.recentDeployments?.length > 0 ? (
              <div className="space-y-3">
                {userStats.recentDeployments.map((w: any) => (
                  <div key={w.id} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{w.name}</span>
                      <span className="text-xs text-blue-400">{w.status}</span>
                    </div>
                    <span className="text-xs text-gray-500">Path: coles.id{w.path}</span>
                    {w.domain && <span className="text-xs text-green-400">Domain: {w.domain}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <Globe className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No recent deployments. Start by adding a website from the Websites menu.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
