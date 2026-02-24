'use client';

import { motion } from 'framer-motion';
import {
    GitBranch,
    Github,
    GitCommit,
    RefreshCw,
    Plus,
    Play,
    Settings,
    Circle,
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_DEPLOYMENTS = [
    { id: 1, repo: 'admin/chatzai', branch: 'main', commit: 'a1b2c3d', status: 'success', time: '10 mins ago', author: 'admin' },
    { id: 2, repo: 'student/portfolio', branch: 'master', commit: 'f4g5h6j', status: 'failed', time: '2 hours ago', author: 'budi123' },
    { id: 3, repo: 'admin/website-v2', branch: 'dev', commit: 'k7l8m9n', status: 'building', time: 'Just now', author: 'system' },
];

export function Deployments() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-indigo-400" />
                        Git Deployments
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage continuous deployment via Git webhooks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300">
                        <Settings className="w-4 h-4 mr-2" />
                        Webhook Keys
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        New Deployment
                    </Button>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        Recent Deployments
                    </h3>
                    <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
                <div className="divide-y divide-white/5">
                    {MOCK_DEPLOYMENTS.map((deploy, i) => (
                        <motion.div
                            key={deploy.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {deploy.status === 'success' && <Circle className="w-3 h-3 text-green-500 fill-green-500" />}
                                    {deploy.status === 'failed' && <Circle className="w-3 h-3 text-red-500 fill-red-500" />}
                                    {deploy.status === 'building' && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{deploy.repo}</span>
                                        <Badge variant="outline" className="border-white/10 text-gray-400 font-mono text-xs">
                                            <GitBranch className="w-3 h-3 mr-1 inline" />
                                            {deploy.branch}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <GitCommit className="w-3 h-3" />
                                            {deploy.commit}
                                        </span>
                                        <span>•</span>
                                        <span>{deploy.time}</span>
                                        <span>•</span>
                                        <span>by {deploy.author}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {deploy.status === 'failed' && (
                                    <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                        View Logs
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                                    <Play className="w-4 h-4 mr-2" />
                                    Redeploy
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
