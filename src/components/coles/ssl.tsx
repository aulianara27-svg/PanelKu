'use client';

import { motion } from 'framer-motion';
import {
    Shield,
    Plus,
    RefreshCw,
    Lock,
    Unlock,
    AlertTriangle,
    UploadCloud,
    CheckCircle2,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_SSL = [
    { id: 1, domain: 'coles.id', provider: "Let's Encrypt", validFrom: '2025-12-10', validTo: '2026-03-10', autoRenew: true, status: 'valid' },
    { id: 2, domain: 'student.coles.id', provider: "Custom", validFrom: '2025-01-01', validTo: '2026-01-01', autoRenew: false, status: 'valid' },
    { id: 3, domain: 'tes-project.com', provider: "Let's Encrypt", validFrom: '2023-01-01', validTo: '2023-04-01', autoRenew: true, status: 'expired' },
];

export function SSLManager() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-400" />
                        SSL Certificates
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage Let's Encrypt and custom SSL certificates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Upload Custom SSL
                    </Button>
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Issue Let's Encrypt
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_SSL.map((cert, i) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1",
                            cert.status === 'valid' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                        )} />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    {cert.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                                    {cert.domain}
                                </h3>
                                <Badge variant="outline" className="mt-2 border-white/10 text-gray-400">
                                    {cert.provider}
                                </Badge>
                            </div>

                            <div className="p-2 rounded-lg bg-white/5">
                                {cert.status === 'valid' ? <Shield className="w-6 h-6 text-green-400" /> : <Unlock className="w-6 h-6 text-red-400" />}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <span className="text-xs text-gray-500">Valid From</span>
                                <p className="text-sm text-gray-300">{cert.validFrom}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Expires On</span>
                                <p className={cn("text-sm font-medium", cert.status === 'valid' ? 'text-gray-300' : 'text-red-400')}>{cert.validTo}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", cert.autoRenew ? "bg-blue-400" : "bg-gray-500")} />
                                <span className="text-xs text-gray-400">Auto Renew: {cert.autoRenew ? 'ON' : 'OFF'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {cert.status === 'expired' && (
                                    <Button variant="ghost" size="icon" title="Renew Now" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" title="Delete" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
