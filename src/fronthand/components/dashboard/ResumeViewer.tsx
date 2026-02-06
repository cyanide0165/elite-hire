"use client";

import { FileText, X, Download, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface ResumeViewerProps {
    url: string;
    candidateName: string;
    fileType?: string;
}

export default function ResumeViewer({ url, candidateName, fileType }: ResumeViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading state when url changes or modal opens
    useEffect(() => {
        if (isOpen) setIsLoading(true);
    }, [isOpen, url]);

    // Check if file is viewable (PDF, Image, or DOCX via API conversion)
    const isViewable =
        fileType?.includes("pdf") ||
        fileType?.includes("image") ||
        fileType?.includes("wordprocessingml.document");

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
            >
                <FileText className="w-4 h-4" />
                View Resume
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-5xl h-[85vh] bg-background rounded-xl shadow-2xl flex flex-col border border-border animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg leading-none">{candidateName}'s Resume</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Previewing document</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={url}
                                    download
                                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-muted/20 relative overflow-hidden flex flex-col items-center justify-center">
                            {isViewable ? (
                                <>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground gap-2 bg-background/50 z-10">
                                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            Loading...
                                        </div>
                                    )}
                                    <iframe
                                        src={url}
                                        className="w-full h-full"
                                        onLoad={() => setIsLoading(false)}
                                        title="Resume Preview"
                                    />
                                </>
                            ) : (
                                <div className="text-center p-6 max-w-md">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">Preview Not Available</h4>
                                    <p className="text-muted-foreground mb-6">
                                        This file format ({fileType || "unknown"}) cannot be previewed directly in the browser.
                                    </p>
                                    <a
                                        href={url}
                                        download
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
