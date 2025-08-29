import React from "react";
import { User, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Bio } from "../forms/form-schemas/bio-schema";

interface BioDisplayProps {
  bio: Bio;
  onEdit: () => void;
}

export function BioDisplay({ bio, onEdit }: BioDisplayProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Bio
            </CardTitle>
            <CardDescription>Your professional bio information</CardDescription>
          </div>
          <Button onClick={onEdit} variant="outline">
            Edit Bio
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg">{bio.name}</h3>
        </div>

        <div>
          <h4 className="font-medium mb-2">Designations</h4>
          <div className="flex flex-wrap gap-2">
            {bio.designations.map((designation, index) => (
              <Badge key={index} variant="secondary">
                {designation}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-muted-foreground leading-relaxed">{bio.desc}</p>
        </div>

        {bio.profileImage && (
          <div>
            <h4 className="font-medium mb-2">Profile Image</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <a
                href={bio.profileImage}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View Profile Image
              </a>
            </div>
          </div>
        )}

        {bio.resumeUrl && (
          <div>
            <h4 className="font-medium mb-2">Resume</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <a
                href={bio.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View Resume
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
