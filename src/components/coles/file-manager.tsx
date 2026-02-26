'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  File,
  FileCode,
  FileImage,
  FileArchive,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Edit,
  Download,
  Upload,
  FolderPlus,
  RefreshCw,
  Home,
  ArrowUp,
  Grid,
  List,
  Search,
  Lock,
  Eye,
  Loader2,
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  permissions: string;
  owner: string;
  group: string;
  modifiedAt: Date;
  mimeType: string | null;
}



const formatBytes = (bytes: number) => {
  if (bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file: FileItem) => {
  if (file.type === 'directory') return Folder;

  const mime = file.mimeType || '';
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('zip') || ext === 'zip' || ext === 'tar' || ext === 'gz') return FileArchive;
  if (mime.includes('json') || ext === 'json' || ext === 'php' || ext === 'js' || ext === 'ts') return FileCode;
  if (mime.startsWith('text/')) return FileText;

  return File;
};

const getFileIconColor = (file: FileItem) => {
  if (file.type === 'directory') return 'text-yellow-400';

  const mime = file.mimeType || '';
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (mime.startsWith('image/')) return 'text-pink-400';
  if (mime.includes('zip') || ext === 'zip') return 'text-orange-400';
  if (ext === 'php') return 'text-violet-400';
  if (ext === 'js' || ext === 'ts') return 'text-yellow-400';
  if (ext === 'json') return 'text-green-400';
  if (ext === 'env') return 'text-red-400';

  return 'text-gray-400';
};

export function FileManager() {
  const { toast } = useToast();
  const { mockRole, user } = useAuthStore();
  const baseDir = (mockRole === 'superadmin' || mockRole === 'admin') ? '/var/www' : user ? `/var/www/student_${user.username}` : '/var/www';
  const [currentPath, setCurrentPath] = useState(baseDir);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [clipboard, setClipboard] = useState<{ files: string[]; operation: 'copy' | 'cut' } | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pathParts = currentPath.split('/').filter(Boolean);

  const fetchFiles = useCallback(async (dirPath: string) => {
    setIsLoading(true);
    try {
      const { user, mockRole } = useAuthStore.getState();
      const userIdStr = user && (mockRole !== 'superadmin' && mockRole !== 'admin') ? `&userId=${user.id}` : '';
      const res = await fetch(`/api/files?dir=${encodeURIComponent(dirPath)}&requesterRole=${mockRole}${userIdStr}`);
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();

      const parsedData = data.files.map((d: any) => ({
        ...d,
        modifiedAt: new Date(d.modifiedAt),
      }));
      setFiles(parsedData);
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access directory. Maybe no permission/does not exist.',
        variant: 'destructive',
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const filteredFiles = files.filter(
    (file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (path: string, multi: boolean = false) => {
    if (multi) {
      setSelectedFiles((prev) =>
        prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
      );
    } else {
      setSelectedFiles([path]);
    }
  };

  const handleAction = async (action: string, targetPath: string, extraData?: any) => {
    try {
      const res = await fetch('/api/files/action', {
        method: 'POST',
        body: JSON.stringify({ action, targetPath, ...extraData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      return data;
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
      throw err;
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Nama folder baru:');
    if (!name) return;
    await handleAction('mkdir', `${currentPath}/${name}`);
    fetchFiles(currentPath);
  };

  const handleDelete = async (filePath: string) => {
    if (!confirm(`Yakin ingin menghapus ${filePath}?`)) return;
    await handleAction('delete', filePath);
    fetchFiles(currentPath);
  };

  const handleEdit = async (filePath: string) => {
    const isFile = files.find(f => f.path === filePath)?.type === 'file';
    if (!isFile) return;
    const data = await handleAction('read', filePath);
    const newContent = prompt(`Edit isi file ${filePath}:`, data.content);
    if (newContent !== null) {
      await handleAction('write', filePath, { content: newContent });
      toast({ title: 'Sukses', description: 'File berhasil diupdate' });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetPath', `${currentPath}/${file.name}`);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal upload file');
      }

      toast({ title: 'Sukses', description: `File ${file.name} berhasil di-upload!` });
      fetchFiles(currentPath);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  const handleExtract = async (filePath: string) => {
    if (!filePath.endsWith('.zip')) {
      toast({ title: 'Error', description: 'Hanya mendukung ekstensi .zip', variant: 'destructive' });
      return;
    }
    toast({ title: 'Info', description: 'Sedang mengekstrak ZIP...' });
    await handleAction('extract', filePath);
    toast({ title: 'Sukses', description: 'ZIP berhasil diekstrak!' });
    fetchFiles(currentPath);
  };

  const FileItemComponent = ({ file }: { file: FileItem }) => {
    const Icon = getFileIcon(file);
    const iconColor = getFileIconColor(file);
    const isSelected = selectedFiles.includes(file.path);

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={(e) => handleSelect(file.path, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => {
              if (file.type === 'directory') {
                setCurrentPath(file.path);
              }
            }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
              isSelected
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'hover:bg-white/5 border border-transparent'
            )}
          >
            {viewMode === 'list' ? (
              <>
                <Icon className={cn('w-5 h-5 flex-shrink-0', iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.permissions} • {file.owner}:{file.group}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{formatBytes(file.size)}</p>
                  <p className="text-xs text-gray-500">
                    {file.modifiedAt.toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <Icon className={cn('w-10 h-10 mb-2', iconColor)} />
                <p className="text-sm text-white text-center truncate w-full">{file.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
              </div>
            )}
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-[#0a0c10] border-blue-500/20">
          {file.type === 'directory' && (
            <ContextMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
              <Folder className="w-4 h-4 mr-2" />
              Open Folder
            </ContextMenuItem>
          )}
          <ContextMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
            <Eye className="w-4 h-4 mr-2" />
            View
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/10" />
          <ContextMenuItem
            className="text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setClipboard({ files: [file.path], operation: 'copy' })}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem
            className="text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setClipboard({ files: [file.path], operation: 'cut' })}
          >
            <Scissors className="w-4 h-4 mr-2" />
            Cut
          </ContextMenuItem>
          {clipboard && (
            <ContextMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
              <Clipboard className="w-4 h-4 mr-2" />
              Paste Here
            </ContextMenuItem>
          )}
          <ContextMenuSeparator className="bg-white/10" />
          {file.type === 'file' && (
            <ContextMenuItem className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => handleEdit(file.path)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </ContextMenuItem>
          )}
          {file.type === 'file' && file.name.endsWith('.zip') && (
            <ContextMenuItem className="text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => handleExtract(file.path)}>
              <FileArchive className="w-4 h-4 mr-2" />
              Extract ZIP
            </ContextMenuItem>
          )}
          <ContextMenuItem className="text-gray-300 hover:text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Download
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/10" />
          <ContextMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(file.path)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/10"
            onClick={() => setCurrentPath(baseDir)}
          >
            <Home className="w-4 h-4 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/10"
            onClick={() => {
              const newPath = pathParts.slice(0, -1).join('/');
              // prevent going above /var/www if we want to restrict them
              if (!newPath || newPath === 'var' || newPath === '' || (mockRole !== 'superadmin' && mockRole !== 'admin' && !(`/${newPath}`.startsWith(baseDir)))) {
                setCurrentPath(baseDir);
              } else {
                setCurrentPath('/' + newPath);
              }
            }}
          >
            <ArrowUp className="w-4 h-4 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex-1 overflow-x-auto">
          <span className="text-gray-400">/</span>
          {pathParts.map((part, index) => (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <button
                onClick={() => setCurrentPath('/' + pathParts.slice(0, index + 1).join('/'))}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {part}
              </button>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-40 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          // @ts-ignore - directory attributes are non-standard
          webkitdirectory="true"
          directory="true"
          onChange={handleUpload}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#0a0c10] border-blue-500/20">
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => fileInputRef.current?.click()}>
              <File className="w-4 h-4 mr-2" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => folderInputRef.current?.click()}>
              <Folder className="w-4 h-4 mr-2" />
              Upload Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="border-white/10 text-gray-300" onClick={handleCreateFolder}>
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* File List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {viewMode === 'list' && (
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wide">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-2">Permissions</div>
          </div>
        )}
        <div className={cn(
          'p-2',
          viewMode === 'grid' && 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2'
        )}>
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
              >
                <FileItemComponent file={file} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
        <span>{filteredFiles.length} items</span>
        {selectedFiles.length > 0 && (
          <span>{selectedFiles.length} selected</span>
        )}
        {clipboard && (
          <span className="text-blue-400">
            {clipboard.files.length} file(s) in clipboard ({clipboard.operation})
          </span>
        )}
      </div>
    </motion.div>
  );
}
