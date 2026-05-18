"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Tech } from "@/types/database";
import { Bookmark, ExternalLink, GitFork } from "lucide-react";
import Image from "next/image";

interface TechCardProps {
    tech: Tech;
    isBookmarked: boolean;
    onBookmark: (techId: string) => void;
    onClick: (tech: Tech) => void;
}

export function TechCard({ tech, isBookmarked, onBookmark, onClick }: TechCardProps) {
    const displayImage = tech.og_image;
    const displayTitle = tech.og_title ?? tech.name;
    const displayDesc = tech.og_description ?? tech.description;

    return (
        <Card
            className="group flex flex-col overflow-hidden border-border transition-all duration-200 hover:border-ring/50 hover:shadow-md cursor-pointer p-0"
            onClick={() => onClick(tech)}
        >
            {/* OG Image or fallback */}
            {displayImage ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                        src={displayImage}
                        alt={displayTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <span className="text-2xl font-bold text-muted-foreground/30 select-none">
                        {tech.name.slice(0, 2).toUpperCase()}
                    </span>
                </div>
            )}

            <CardContent className="flex flex-1 flex-col gap-3 p-4">
                {/* Header */}
                <div className="flex items-start gap-2">
                    {tech.favicon && (
                        <img
                            src={tech.favicon}
                            alt=""
                            className="mt-0.5 h-5 w-5 shrink-0 rounded object-contain"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="truncate font-semibold leading-tight">{tech.name}</h3>
                        {tech.url && (
                            <p className="truncate text-xs text-muted-foreground">{new URL(tech.url).hostname}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                {displayDesc && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {displayDesc}
                    </p>
                )}

                {/* Tags */}
                {tech.tags && tech.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tech.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-[10px]">
                                {tag.name}
                            </Badge>
                        ))}
                        {tech.tags.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                                +{tech.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex gap-1.5">
                        {tech.url && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a href={tech.url} target="_blank" rel="noopener noreferrer" aria-label="Visit website">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </Button>
                        )}
                        {tech.github_url && (
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a href={tech.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <GitFork className="h-3.5 w-3.5" />
                                </a>
                            </Button>
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`h-7 w-7 transition-colors ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBookmark(tech.id);
                        }}
                        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                        <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
