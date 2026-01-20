"use client";

import { BioFormWrapper } from "@/components/bio-page/bio-form-wrapper";
import { type Bio } from "@/components/forms/form-schemas/bio-schema";
import React from "react";
import { UserCircle } from "lucide-react";

const BioPage = () => {
  const handleSuccess = (bio: Bio) => {
    console.log("Bio operation successful:", bio);
  };

  const handleError = (error: string) => {
    console.error("Bio operation failed:", error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      <div className="container mx-auto py-12 px-4 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-foreground dark:via-blue-400 dark:to-purple-400">
                  Bio Profile
                </h1>
                <p className="text-xl text-muted-foreground mt-1 font-medium italic">
                  Manage your professional identity and presence
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <BioFormWrapper onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
};

export default BioPage;

