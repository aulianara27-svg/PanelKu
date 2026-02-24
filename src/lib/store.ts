import { create } from 'zustand';
import type {
  User,
  Service,
  ServerMetric,
  Alert,
  Website,
  Database,
  FileItem,
  NavItem,
  SidebarState
} from '@/types';

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  mockRole: 'superadmin' | 'admin' | 'student';
  setMockRole: (role: 'superadmin' | 'admin' | 'student') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  mockRole: 'superadmin',
  setMockRole: (role) => set({ mockRole: role }),
}));

// ============================================
// SIDEBAR STORE
// ============================================

interface SidebarStore extends SidebarState {
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleGroup: (group: string) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  activeItem: 'dashboard',
  expandedGroups: ['hosting', 'server'],
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setActiveItem: (item) => set({ activeItem: item }),
  toggleGroup: (group) => set((state) => ({
    expandedGroups: state.expandedGroups.includes(group)
      ? state.expandedGroups.filter((g) => g !== group)
      : [...state.expandedGroups, group],
  })),
}));

// ============================================
// DASHBOARD STORE
// ============================================

interface DashboardState {
  metrics: ServerMetric[];
  services: Service[];
  alerts: Alert[];
  isLoading: boolean;
  setMetrics: (metrics: ServerMetric[]) => void;
  setServices: (services: Service[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: [],
  services: [],
  alerts: [],
  isLoading: true,
  setMetrics: (metrics) => set({ metrics }),
  setServices: (services) => set({ services }),
  setAlerts: (alerts) => set({ alerts }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================
// WEBSITE STORE
// ============================================

interface WebsiteState {
  websites: Website[];
  selectedWebsite: Website | null;
  isLoading: boolean;
  setWebsites: (websites: Website[]) => void;
  selectWebsite: (website: Website | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWebsiteStore = create<WebsiteState>((set) => ({
  websites: [],
  selectedWebsite: null,
  isLoading: true,
  setWebsites: (websites) => set({ websites }),
  selectWebsite: (website) => set({ selectedWebsite: website }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================
// DATABASE STORE
// ============================================

interface DatabaseState {
  databases: Database[];
  isLoading: boolean;
  setDatabases: (databases: Database[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  databases: [],
  isLoading: true,
  setDatabases: (databases) => set({ databases }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================
// FILE MANAGER STORE
// ============================================

interface FileManagerState {
  currentPath: string;
  files: FileItem[];
  selectedFiles: string[];
  clipboard: { files: string[]; operation: 'copy' | 'cut' } | null;
  isLoading: boolean;
  setCurrentPath: (path: string) => void;
  setFiles: (files: FileItem[]) => void;
  selectFile: (path: string, multi?: boolean) => void;
  clearSelection: () => void;
  setClipboard: (clipboard: { files: string[]; operation: 'copy' | 'cut' } | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFileManagerStore = create<FileManagerState>((set) => ({
  currentPath: '/var/www',
  files: [],
  selectedFiles: [],
  clipboard: null,
  isLoading: true,
  setCurrentPath: (path) => set({ currentPath: path }),
  setFiles: (files) => set({ files }),
  selectFile: (path, multi = false) => set((state) => {
    if (multi) {
      const isSelected = state.selectedFiles.includes(path);
      return {
        selectedFiles: isSelected
          ? state.selectedFiles.filter((p) => p !== path)
          : [...state.selectedFiles, path],
      };
    }
    return { selectedFiles: [path] };
  }),
  clearSelection: () => set({ selectedFiles: [] }),
  setClipboard: (clipboard) => set({ clipboard }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================
// AI CHAT STORE
// ============================================

interface AIChatState {
  isOpen: boolean;
  conversationId: string | null;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setConversation: (id: string | null) => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  isOpen: false,
  conversationId: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setConversation: (id) => set({ conversationId: id }),
}));

// ============================================
// UI STORE
// ============================================

interface UIState {
  theme: 'dark' | 'light';
  sidebarWidth: number;
  toggleTheme: () => void;
  setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarWidth: 260,
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
}));
