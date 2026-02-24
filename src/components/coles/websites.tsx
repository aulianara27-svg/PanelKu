'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  Shield,
  Server,
  Folder,
  Clock,
  Copy,
  Power,
  Loader2,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Website {
  id: string;
  name: string;
  path: string;
  domain: string | null;
  environment: string;
  sslEnabled: boolean;
  status: 'active' | 'suspended' | 'error';
  diskUsage: number;
  bandwidthUsage: number;
  createdAt: Date;
  owner?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function Websites() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newSite, setNewSite] = useState({
    name: '',
    path: '',
    domain: '',
    environment: 'static',
  });

  const fetchWebsites = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/websites');
      if (!res.ok) throw new Error('Failed to fetch websites');
      const data = await res.json();

      const parsedData = data.map((d: any) => ({
        ...d,
        environment: d.phpVersion || 'static',
        createdAt: new Date(d.createdAt),
        owner: d.user?.username || 'admin',
      }));
      setWebsites(parsedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load websites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleCreateWebsite = async () => {
    if (!newSite.name || !newSite.path) {
      toast({
        title: 'Validation Error',
        description: 'Please fill out Name and Path.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create website');

      toast({
        title: 'Success',
        description: 'Website created successfully.',
      });

      setShowCreateDialog(false);
      setNewSite({ name: '', path: '', domain: '', environment: 'static' });
      fetchWebsites();
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

  const filteredWebsites = websites.filter(
    (site) => {
      const query = (searchQuery || '').toLowerCase();
      const n = (site.name || '').toLowerCase();
      const p = (site.path || '').toLowerCase();
      const o = (site.owner || '').toLowerCase();
      return n.includes(query) || p.includes(query) || o.includes(query);
    }
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
            placeholder="Search websites..."
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
          Add Website
        </Button>
      </div>

      {/* Websites Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium">Website</TableHead>
              <TableHead className="text-gray-400 font-medium">Path / Domain</TableHead>
              <TableHead className="text-gray-400 font-medium">PHP</TableHead>
              <TableHead className="text-gray-400 font-medium">SSL</TableHead>
              <TableHead className="text-gray-400 font-medium">Status</TableHead>
              <TableHead className="text-gray-400 font-medium">Usage</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredWebsites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                    No websites found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWebsites.map((website, index) => (
                  <motion.tr
                    key={website.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedWebsite(website)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{website.name}</p>
                          <p className="text-xs text-gray-500">by {website.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-mono">{website.path}</span>
                        {website.domain && (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            {website.domain}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400">
                        {website.environment === 'static' ? 'Static HTML' :
                          website.environment === 'node' ? 'Node.js' :
                            website.environment.includes('php') ? `PHP ${website.environment.replace('php', '')}` : website.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {website.sslEnabled ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs">Active</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No SSL</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                        website.status === 'active' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                        website.status === 'suspended' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                        website.status === 'error' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                      )}>
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          website.status === 'active' && 'bg-green-500',
                          website.status === 'suspended' && 'bg-yellow-500',
                          website.status === 'error' && 'bg-red-500',
                        )} />
                        {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-400">
                          Disk: <span className="text-white">{formatBytes(website.diskUsage)}</span>
                        </span>
                        <span className="text-gray-400">
                          BW: <span className="text-white">{formatBytes(website.bandwidthUsage)}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#0a0c10] border-blue-500/20">
                          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Config
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                            <Folder className="w-4 h-4 mr-2" />
                            File Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate SSL
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
                            <Copy className="w-4 h-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                            <Power className="w-4 h-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Add Website Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-[#0a0c10] border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Add New Website
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new website workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site_name" className="text-gray-300">Project / Site Name *</Label>
              <Input
                id="site_name"
                placeholder="e.g., My Portfolio"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path" className="text-gray-300">Folder Path / Identifier *</Label>
              <Input
                id="path"
                placeholder="e.g., student_budi_web"
                value={newSite.path}
                onChange={(e) => setNewSite({ ...newSite, path: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-gray-300">Custom Domain (Optional)</Label>
              <Input
                id="domain"
                placeholder="e.g., budi.coles.id"
                value={newSite.domain}
                onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Environment (Tech Stack)</Label>
              <Select value={newSite.environment} onValueChange={(v) => setNewSite({ ...newSite, environment: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c10] border-blue-500/20">
                  <SelectItem value="static">Static HTML / React / Vue Build</SelectItem>
                  <SelectItem value="php8.2">PHP 8.2 (WordPress, Laravel)</SelectItem>
                  <SelectItem value="node">Node.js (PM2 App)</SelectItem>
                  <SelectItem value="python">Python (Django / Flask)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newSite.path && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs leading-relaxed text-blue-200 mt-2">
                <span className="font-semibold text-blue-400">What happens next?</span>
                <br />
                A folder named <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300">/var/www/{newSite.path}</code> will be created automatically. You can upload your files into that folder using the <strong>File Manager</strong> menu.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={handleCreateWebsite} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Website
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Website Detail Dialog */}
      <Dialog open={!!selectedWebsite} onOpenChange={() => setSelectedWebsite(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0c10] border-blue-500/20">
          {selectedWebsite && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  {selectedWebsite.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Website details and configuration
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Document Root</p>
                    <p className="text-sm text-white font-mono">{selectedWebsite.path}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Domain</p>
                    <p className="text-sm text-white">
                      {selectedWebsite.domain || 'Path-based hosting'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Owner</p>
                    <p className="text-sm text-white">{selectedWebsite.owner}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Environment</p>
                    <p className="text-sm text-white">
                      {selectedWebsite.environment === 'static' ? 'Static HTML' :
                        selectedWebsite.environment === 'node' ? 'Node.js' :
                          selectedWebsite.environment?.includes('php') ? `PHP ${selectedWebsite.environment.replace('php', '')}` : selectedWebsite.environment}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">SSL Status</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      {selectedWebsite.sslEnabled ? (
                        <>
                          <Shield className="w-4 h-4 text-green-400" />
                          Enabled
                        </>
                      ) : 'Disabled'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {selectedWebsite.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="border-white/10 text-gray-300">
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                  Open in File Manager
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
