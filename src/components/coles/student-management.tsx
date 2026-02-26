'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Globe,
  Database,
  HardDrive,
  Clock,
  Mail,
  Shield,
  Key,
  Trash2,
  Edit,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface Student {
  id: string;
  username: string;
  email: string;
  name: string;
  role?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  lastLoginAt: Date | null;
  limits?: {
    maxWebsites: number;
    maxDatabases: number;
    maxDiskSpace: number;
    maxBandwidth: number;
  };
  // We'll mock the usage info for now until we have real usage data collected
  usage?: {
    websites: number;
    databases: number;
    diskSpace: number;
    bandwidth: number;
  };
  path?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function StudentManagement() {
  const { mockRole } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phpVersion: '8.2',
    targetRole: 'student',
    maxWebsites: 3,
    maxDatabases: 3,
    maxDiskSpace: 500, // In MB
  });

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students?requesterRole=${mockRole}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();

      // Parse dates from JSON strings
      const parsedData = data.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        lastLoginAt: d.lastLoginAt ? new Date(d.lastLoginAt) : null,
        // Make sure usage is properly defaulted if limits missing
        usage: d.usage || {
          websites: 0,
          databases: 0,
          diskSpace: 0,
          bandwidth: 0,
        },
        path: `/student/${d.username}`
      }));
      setStudents(parsedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, mockRole]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateStudent = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requesterRole: mockRole
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      toast({
        title: 'Success',
        description: 'User created successfully.',
      });

      setFormData({ username: '', name: '', email: '', password: '', phpVersion: '8.2', targetRole: 'student', maxWebsites: 3, maxDatabases: 3, maxDiskSpace: 500 });
      fetchStudents(); // Refresh data
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

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: students.length, color: 'blue' },
          { label: 'Active', value: students.filter(s => s.status === 'active').length, color: 'green' },
          { label: 'Suspended', value: students.filter(s => s.status === 'suspended').length, color: 'yellow' },
          { label: 'Pending', value: students.filter(s => s.status === 'pending').length, color: 'violet' },
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
              stat.color === 'yellow' && 'text-yellow-400',
              stat.color === 'violet' && 'text-violet-400'
            )}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div className="min-h-48 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredStudents.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No students found.
              </div>
            )}
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="glass-card rounded-xl p-5 cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-white font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {student.name}
                        {student.role === 'admin' && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-normal uppercase text-[10px]">
                            Admin
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        student.status === 'active' && 'border-green-500/30 text-green-400',
                        student.status === 'suspended' && 'border-yellow-500/30 text-yellow-400',
                        student.status === 'pending' && 'border-violet-500/30 text-violet-400'
                      )}
                    >
                      {student.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#0a0c10] border-blue-500/20">
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Website
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Path Info */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 mb-4">
                  <code className="text-xs text-green-400">coles.id{student.path}</code>
                </div>

                {/* Resource Usage */}
                <div className="space-y-3">
                  {student.role === 'student' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Websites
                        </span>
                        <span className="text-white">
                          {student.usage?.websites || 0} / {student.limits?.maxWebsites || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Databases
                        </span>
                        <span className="text-white">
                          {student.usage?.databases || 0} / {student.limits?.maxDatabases || 0}
                        </span>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Disk Space
                      </span>
                      <span className="text-white">
                        {formatBytes(student.usage?.diskSpace || 0)} / {formatBytes(student.limits?.maxDiskSpace || 0)}
                      </span>
                    </div>
                    <Progress
                      value={student.limits?.maxDiskSpace ? ((student.usage?.diskSpace || 0) / student.limits.maxDiskSpace) * 100 : 0}
                      className="h-1.5"
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {student.createdAt && student.createdAt.toLocaleDateString()}
                  </span>
                  {student.lastLoginAt ? (
                    <span>Last login: {student.lastLoginAt.toLocaleDateString()}</span>
                  ) : (
                    <span>Never logged in</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Student Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-[#0a0c10] border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Add New User
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new user account and set permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username *</Label>
                <Input
                  id="username"
                  placeholder="e.g., budi123"
                  value={formData.username}
                  onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Strong password"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button
                  variant="outline"
                  className="border-white/10 text-gray-300 shrink-0"
                  onClick={() => {
                    const pass = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase() + '@!';
                    setFormData(p => ({ ...p, password: pass }));
                  }}
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">PHP Version</Label>
                <Select value={formData.phpVersion} onValueChange={(v) => setFormData(p => ({ ...p, phpVersion: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0c10] border-blue-500/20">
                    <SelectItem value="8.3">PHP 8.3 (Latest)</SelectItem>
                    <SelectItem value="8.2">PHP 8.2 (Recommended)</SelectItem>
                    <SelectItem value="8.1">PHP 8.1</SelectItem>
                    <SelectItem value="8.0">PHP 8.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mockRole === 'superadmin' && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Account Role</Label>
                  <Select value={formData.targetRole} onValueChange={(v) => setFormData(p => ({ ...p, targetRole: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0c10] border-blue-500/20">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {(formData.targetRole === 'student' || formData.targetRole === 'user') && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Resource Limits</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {formData.targetRole === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Max Websites</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.maxWebsites}
                          onChange={(e) => setFormData(p => ({ ...p, maxWebsites: parseInt(e.target.value) || 1 }))}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Max DBs</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxDatabases}
                          onChange={(e) => setFormData(p => ({ ...p, maxDatabases: parseInt(e.target.value) || 0 }))}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Disk (MB)</Label>
                    <Input
                      type="number"
                      min="100"
                      value={formData.maxDiskSpace}
                      onChange={(e) => setFormData(p => ({ ...p, maxDiskSpace: parseInt(e.target.value) || 100 }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </>
            )}
            {formData.targetRole === 'student' && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400">
                  The student's website will be accessible at:
                </p>
                <code className="text-sm text-white font-mono">
                  coles.id/student/[username]
                </code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={handleCreateStudent} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0c10] border-blue-500/20">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  {selectedStudent.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Student details and resource usage
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Username</p>
                    <p className="text-white">@{selectedStudent.username}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedStudent.email}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Website Path</p>
                    <code className="text-green-400 text-sm">
                      coles.id{selectedStudent.path}
                    </code>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        selectedStudent.status === 'active' && 'border-green-500/30 text-green-400',
                        selectedStudent.status === 'suspended' && 'border-yellow-500/30 text-yellow-400',
                        selectedStudent.status === 'pending' && 'border-violet-500/30 text-violet-400'
                      )}
                    >
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Resource Usage</p>
                    <div className="space-y-2">
                      {selectedStudent.role === 'student' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Websites</span>
                            <span className="text-white">{selectedStudent.usage?.websites || 0}/{selectedStudent.limits?.maxWebsites || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Databases</span>
                            <span className="text-white">{selectedStudent.usage?.databases || 0}/{selectedStudent.limits?.maxDatabases || 0}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Disk</span>
                        <span className="text-white">
                          {formatBytes(selectedStudent.usage?.diskSpace || 0)} / {formatBytes(selectedStudent.limits?.maxDiskSpace || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="border-white/10 text-gray-300">
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                  Edit Student
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
