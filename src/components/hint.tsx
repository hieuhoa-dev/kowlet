"use client"
import {
    Tooltip, TooltipTrigger, TooltipProvider, TooltipContent,
} from "@/components/ui/tooltip";

interface HintProps {
    label: string;
    children: React.ReactNode;
    side? :"top" | "bottom" | "left" | "right";
    align? :"start" | "center" | "end";
};
export const Hint = ({ label, children, side="top", align="center" }: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align} className="bg-black text-white border border-white/5">
                    <p className="font-medium text-xs">{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
