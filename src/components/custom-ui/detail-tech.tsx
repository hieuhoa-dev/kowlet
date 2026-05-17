"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface TechItem {
    id: string | number;
    name: string;
    description?: string;
    url?: string;
    github_url?: string;
    og_image?: string;
    og_title?: string;
    og_description?: string;
    favicon?: string;
    bookmark_count?: number;
    tags?: { id: string | number; name: string }[];
}

interface DetailTechProps {
    /** Item hiện tại đang xem */
    tech: TechItem | null;
    /** Danh sách tất cả items để điều hướng prev/next */
    items?: TechItem[];
    onClose: () => void;
    onNavigate?: (tech: TechItem) => void;
}

export function DetailTech({ tech, items = [], onClose, onNavigate }: DetailTechProps) {
    const currentIndex = items.findIndex((t) => t.id === tech?.id);

    const handlePrev = () => {
        if (!onNavigate || items.length === 0 || currentIndex < 0) return;
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        onNavigate(items[prevIndex]);
    };

    const handleNext = () => {
        if (!onNavigate || items.length === 0 || currentIndex < 0) return;
        const nextIndex = (currentIndex + 1) % items.length;
        onNavigate(items[nextIndex]);
    };

    return (
        <AnimatePresence>
            {tech !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="detail-tech-title"
                    aria-describedby="detail-tech-description"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl rounded-2xl bg-background shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-3 top-3 z-10"
                            onClick={onClose}
                            aria-label="Close detail"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* OG Image */}
                        {tech.og_image && (
                            <div className="relative w-full aspect-video overflow-hidden bg-muted">
                                <motion.img
                                    key={String(tech.id)}
                                    src={tech.og_image}
                                    alt={tech.og_title ?? tech.name}
                                    className="h-full w-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.25 }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <motion.div
                            key={String(tech.id) + "-content"}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="p-6 space-y-4"
                            id="detail-tech-description"
                        >
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                {tech.favicon && (
                                    <img
                                        src={tech.favicon}
                                        alt=""
                                        className="w-8 h-8 rounded object-contain flex-shrink-0 mt-0.5"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h2
                                        id="detail-tech-title"
                                        className="text-xl font-semibold leading-tight truncate"
                                    >
                                        {tech.name}
                                    </h2>
                                    {tech.og_title && tech.og_title !== tech.name && (
                                        <p className="text-sm text-muted-foreground truncate">
                                            {tech.og_title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {(tech.og_description ?? tech.description) && (
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                    {tech.og_description ?? tech.description}
                                </p>
                            )}

                            {/* Tags */}
                            {tech.tags && tech.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tech.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Links + stats */}
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="flex gap-2">
                                    {tech.url && (
                                        <Button asChild size="sm" variant="default">
                                            <a href={tech.url} target="_blank" rel="noopener noreferrer">
                                                Visit Website
                                            </a>
                                        </Button>
                                    )}
                                    {tech.github_url && (
                                        <Button asChild size="sm" variant="outline">
                                            <a href={tech.github_url} target="_blank" rel="noopener noreferrer">
                                                GitHub
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                {tech.bookmark_count !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                        {tech.bookmark_count} bookmarks
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Prev / Next Navigation (only when items list provided) */}
                        {items.length > 1 && onNavigate && (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    aria-label="Previous technology"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    aria-label="Next technology"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
