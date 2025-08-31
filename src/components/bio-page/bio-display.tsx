import React from "react";
import {
  User,
  FileText,
  Edit,
  Briefcase,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bio } from "../forms/form-schemas/bio-schema";

interface BioDisplayProps {
  bio: Bio;
  onEdit: () => void;
}

export function BioDisplay({ bio, onEdit }: BioDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{bio.name}</CardTitle>
            </div>
          </div>
          <Button
            onClick={onEdit}
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Image */}
        {bio.profileImage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Profile Image
            </div>
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={bio.profileImage}
                alt={`${bio.name} profile`}
                width={800}
                height={400}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Bio Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Name
            </div>
            <p className="text-lg font-medium">{bio.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Designations
            </div>
            <div className="flex flex-wrap gap-2">
              {bio.designations.map((designation, index) => (
                <Badge key={index} variant="secondary">
                  {designation}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Description
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {bio.desc}
            </p>
          </div>
        </div>

        {/* Resume Link */}
        {bio.resumeUrl && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Resume
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={bio.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">View Resume</span>
                </a>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
