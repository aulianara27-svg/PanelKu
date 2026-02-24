// COLES CONTROL - Type Definitions

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'superadmin' | 'admin' | 'student';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// WEBSITE TYPES
// ============================================

export type WebsiteStatus = 'active' | 'suspended' | 'error';

export interface Website {
  id: string;
  userId: string;
  name: string;
  path: string;
  domain: string | null;
  documentRoot: string;
  phpVersion: string;
  sslEnabled: boolean;
  sslExpiry: Date | null;
  status: WebsiteStatus;
  diskUsage: number;
  bandwidthUsage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainRedirect {
  id: string;
  websiteId: string;
  fromDomain: string;
  toDomain: string;
  type: '301' | '302';
  enabled: boolean;
  createdAt: Date;
}

export interface Deployment {
  id: string;
  websiteId: string;
  userId: string;
  commitHash: string | null;
  branch: string | null;
  status: 'pending' | 'building' | 'success' | 'failed';
  log: string | null;
  deployedAt: Date | null;
  createdAt: Date;
}

export interface EnvVar {
  id: string;
  websiteId: string;
  key: string;
  value: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DATABASE TYPES
// ============================================

export interface Database {
  id: string;
  userId: string;
  name: string;
  username: string;
  password: string;
  size: number;
  charset: string;
  collation: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseBackup {
  id: string;
  databaseId: string;
  filename: string;
  size: number;
  type: 'manual' | 'scheduled';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

// ============================================
// SERVICE TYPES
// ============================================

export type ServiceName = 'nginx' | 'php-fpm' | 'mysql' | 'redis' | 'pm2' | 'nodejs';
export type ServiceStatus = 'running' | 'stopped' | 'error';

export interface Service {
  id: string;
  name: ServiceName;
  displayName: string;
  status: ServiceStatus;
  version: string | null;
  port: number | null;
  cpuUsage: number;
  memUsage: number;
  uptime: number;
  lastRestart: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CronJob {
  id: string;
  userId: string;
  name: string;
  command: string;
  schedule: string;
  isEnabled: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  status: 'idle' | 'running' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MONITORING TYPES
// ============================================

export interface ServerMetric {
  id: string;
  cpuUsage: number;
  memUsage: number;
  diskUsage: number;
  diskRead: number;
  diskWrite: number;
  netIn: number;
  netOut: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
  uptime: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'service';
  severity: 'warning' | 'critical';
  message: string;
  value: number | null;
  threshold: number | null;
  isResolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
}

// ============================================
// FILE MANAGER TYPES
// ============================================

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  permissions: string;
  owner: string;
  group: string;
  modifiedAt: Date;
  createdAt: Date;
  isEditable: boolean;
  mimeType: string | null;
}

export interface FilePermission {
  id: string;
  path: string;
  owner: string;
  group: string;
  mode: string;
  isRecursive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AI ASSISTANT TYPES
// ============================================

export interface AIConversation {
  id: string;
  userId: string;
  title: string | null;
  context: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  createdAt: Date;
}

export interface AIFixLog {
  id: string;
  type: string;
  filePath: string | null;
  original: string | null;
  fixed: string | null;
  description: string;
  status: 'pending' | 'applied' | 'reverted';
  appliedAt: Date | null;
  revertedAt: Date | null;
  createdAt: Date;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ============================================
// STUDENT LIMITS
// ============================================

export interface StudentLimit {
  id: string;
  userId: string;
  maxWebsites: number;
  maxDatabases: number;
  maxDiskSpace: number;
  maxBandwidth: number;
  maxCronJobs: number;
  allowSSL: boolean;
  allowCustomDomain: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
  children?: NavItem[];
  roles?: UserRole[];
}

export interface SidebarState {
  isCollapsed: boolean;
  activeItem: string | null;
  expandedGroups: string[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

export interface MetricSeries {
  name: string;
  color: string;
  data: ChartDataPoint[];
}
