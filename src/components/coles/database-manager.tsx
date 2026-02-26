'use client';

import { motion } from 'framer-motion';
import {
  Database,
  Plus,
  Search,
  MoreVertical,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Key,
  HardDrive,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatabaseItem {
  id: string;
  name: string;
  username: string;
  password: string;
  size: number;
  charset: string;
  collation: string;
  status: 'active' | 'suspended';
  owner?: string;
  createdAt: Date;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DatabaseManager() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newDb, setNewDb] = useState({
    name: '',
    username: '',
    password: '',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  });

  const fetchDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const { user, mockRole } = useAuthStore.getState();
      const userIdStr = user && (mockRole !== 'superadmin' && mockRole !== 'admin') ? `&userId=${user.id}` : '';
      const res = await fetch(`/api/databases?requesterRole=${mockRole}${userIdStr}`);
      if (!res.ok) throw new Error('Failed to fetch databases');
      const data = await res.json();

      const parsedData = data.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        owner: d.user?.username || 'admin',
      }));
      setDatabases(parsedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load databases',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleCreateDatabase = async () => {
    if (!newDb.name || !newDb.username || !newDb.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create database');

      toast({
        title: 'Success',
        description: 'Database created successfully.',
      });

      setShowCreateDialog(false);
      setNewDb({ name: '', username: '', password: '', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' });
      fetchDatabases();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredDatabases = databases.filter(
    (db) =>
      db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (db.owner && db.owner.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search databases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            <Upload className="w-4 h-4 mr-2" />
            Import SQL
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Database
          </Button>
        </div>
      </div>

      {/* Database Cards Grid */}
      {isLoading ? (
        <div className="min-h-48 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatabases.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No databases found.
            </div>
          )}
          {filteredDatabases.map((db, index) => (
            <motion.div
              key={db.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Database className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{db.name}</h3>
                    <p className="text-xs text-gray-500">by {db.owner}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#0a0c10] border-blue-500/20">
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                      <Download className="w-4 h-4 mr-2" />
                      Export SQL
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                      <Upload className="w-4 h-4 mr-2" />
                      Import SQL
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Optimize
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Database
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                {/* Connection Info */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Username</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Copy className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                  <code className="text-sm text-green-400">{db.username}</code>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Password</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setShowPassword(showPassword === db.id ? null : db.id)}
                    >
                      {showPassword === db.id ? (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Eye className="w-3 h-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <code className="text-sm text-yellow-400">
                    {showPassword === db.id ? db.password : '••••••••••••'}
                  </code>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <HardDrive className="w-4 h-4" />
                    <span>{formatBytes(db.size)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{db.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <Badge
                  variant="outline"
                  className={cn(
                    db.status === 'active'
                      ? 'border-green-500/30 text-green-400'
                      : 'border-yellow-500/30 text-yellow-400'
                  )}
                >
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full mr-1.5',
                    db.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  {db.status.charAt(0).toUpperCase() + db.status.slice(1)}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Database Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-[#0a0c10] border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Create New Database
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new MySQL database for a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dbname" className="text-gray-300">Database Name *</Label>
              <Input
                id="dbname"
                placeholder="e.g., my_database"
                value={newDb.name}
                onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username *</Label>
              <Input
                id="username"
                placeholder="e.g., db_user"
                value={newDb.username}
                onChange={(e) => setNewDb({ ...newDb, username: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Click generate"
                  value={newDb.password}
                  onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button
                  variant="outline"
                  className="border-white/10 text-gray-300"
                  onClick={() => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
                    let pass = '';
                    for (let i = 0; i < 16; i++) {
                      pass += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    setNewDb({ ...newDb, password: pass });
                  }}
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Charset</Label>
              <Select value={newDb.charset} onValueChange={(v) => setNewDb({ ...newDb, charset: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c10] border-blue-500/20">
                  <SelectItem value="utf8mb4">utf8mb4 (Recommended)</SelectItem>
                  <SelectItem value="utf8">utf8</SelectItem>
                  <SelectItem value="latin1">latin1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-500 text-white" onClick={handleCreateDatabase} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
