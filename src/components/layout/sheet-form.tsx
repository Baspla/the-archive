import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import React from "react";

interface SheetFormContentProps extends React.ComponentPropsWithoutRef<typeof SheetContent> {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function SheetFormContent({ 
    title, 
    description, 
    children, 
    footer, 
    className,
    side = "right",
    ...props 
}: SheetFormContentProps) {
    return (
        <SheetContent side={side} className={cn("overflow-y-auto w-full sm:max-w-lg", className)} {...props}>
            <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
                {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
                {children}
            </div>
            {footer && <SheetFooter>{footer}</SheetFooter>}
        </SheetContent>
    );
}
