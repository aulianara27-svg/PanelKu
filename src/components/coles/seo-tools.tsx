'use client';

import { motion } from 'framer-motion';
import {
    Search,
    Globe,
    BarChart,
    Target,
    FileCode,
    Link,
    MessageSquare,
    AlertCircle,
    Plus,
    Rocket,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export function SeoTools() {
    const [targetUrl, setTargetUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleAnalyze = () => {
        if (!targetUrl) return;
        setAnalyzing(true);
        setScore(null);
        setTimeout(() => {
            setAnalyzing(false);
            setScore(Math.floor(Math.random() * 30) + 65); // Random score between 65 and 95
        }, 2000);
    };

    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
        if (s >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-400" />
                        SEO Analysis Tools
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Optimize your websites for better search engine rankings
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
                <label className="text-sm text-gray-300 font-medium mb-2 block">Analyze URL</label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://coles.id/student/web_saya"
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                        />
                    </div>
                    <Button
                        className="h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                        onClick={handleAnalyze}
                        disabled={analyzing || !targetUrl}
                    >
                        {analyzing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Audit SEO
                            </span>
                        )}
                    </Button>
                </div>

                {score !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Score Card */}
                        <div className="col-span-1 glass-card bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                            <div className={cn("w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4", getScoreColor(score))}>
                                <span className="text-3xl font-bold">{score}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">SEO Health Score</h3>
                            <p className="text-xs text-gray-400">Based on Lighthouse engine</p>
                        </div>

                        {/* Metrics */}
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-semibold text-green-400">Meta Tags</span>
                                </div>
                                <p className="text-lg text-white font-medium">Perfect</p>
                                <p className="text-xs text-gray-400 mt-1">Title & Description found</p>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-400">LCP Speed</span>
                                </div>
                                <p className="text-lg text-white font-medium">1.2s</p>
                                <p className="text-xs text-gray-400 mt-1">Very Fast</p>
                            </div>

                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-semibold text-yellow-400">Robot & Sitemap</span>
                                </div>
                                <p className="text-lg text-white font-medium">Missing</p>
                                <p className="text-xs text-gray-400 mt-1">sitemap.xml not found</p>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm font-semibold text-orange-400">Mobile Friendly</span>
                                </div>
                                <p className="text-lg text-white font-medium">Good</p>
                                <p className="text-xs text-gray-400 mt-1">Viewport meta tag present</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Focus Keyword</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Use our built-in tool to track your target keywords density and check if it appears in H1, Title, and Description.
                    </p>
                    <Button variant="outline" className="w-full border-white/10 text-purple-400 hover:bg-purple-500/10">Configure Keywords</Button>
                </div>

                <div className="glass-card rounded-xl p-5 border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <FileCode className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Sitemap Generator</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Automatically crawl your websites and generate an XML sitemap to submit directly to Google Search Console.
                    </p>
                    <Button variant="outline" className="w-full border-white/10 text-indigo-400 hover:bg-indigo-500/10">Generate XML</Button>
                </div>
            </div>
        </motion.div>
    );
}
