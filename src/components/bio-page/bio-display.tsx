import React from "react";
import { User, FileText, Edit, Briefcase, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Bio } from "../forms/form-schemas/bio-schema";

interface BioDisplayProps {
  bio: Bio;
  onEdit: () => void;
}

export function BioDisplay({ bio, onEdit }: BioDisplayProps) {
  return (
    <Card className="w-full relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[32px]">
      {/* Decorative Gradient elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[120px] -z-10 rounded-full" />

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x border-border/10">
          {/* Left Section: Profile Image */}
          <div className="lg:w-1/3 p-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[40px] blur opacity-25 group-hover:opacity-60 transition duration-500" />
              <div className="relative h-64 w-64 rounded-[32px] overflow-hidden border-4 border-background shadow-2xl">
                {bio.profileImage ? (
                  <Image
                    src={bio.profileImage}
                    alt={`${bio.name} profile`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">{bio.name}</h2>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {bio.designations.map((designation, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1"
                  >
                    {designation}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={onEdit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-blue-500/20 transition-all duration-300 rounded-2xl h-12 font-bold group"
            >
              <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Modify Profile
            </Button>
          </div>

          {/* Right Section: Details */}
          <div className="lg:w-2/3 p-10 space-y-10 bg-background/20 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500/80">
                <FileText className="h-4 w-4" />
                Engineering Narrative
              </div>
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium">
                  {bio.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">
                  <ExternalLink className="h-4 w-4" />
                  Portfolio Asset
                </div>
                {bio.resumeUrl ? (
                  <a 
                    href={bio.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-sm">Download CV/Resume</span>
                      <span className="block text-xs text-muted-foreground">PDF Document</span>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed text-muted-foreground">
                    <FileText className="h-5 w-5 opacity-30" />
                    <span className="text-sm font-medium">Resume not uploaded</span>
                  </div>
                )}
              </div>

              {/* Maybe add social links here if needed */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-500/80">
                  <Briefcase className="h-4 w-4" />
                  Current Focus
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm">Full Bio</span>
                    <span className="block text-xs text-muted-foreground">Public Portfolio Identity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
