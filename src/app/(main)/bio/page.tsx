"use client";

import { BioFormWrapper } from "@/components/bio-page/bio-form-wrapper";
import { type Bio } from "@/components/forms/form-schemas/bio-schema";
import React from "react";

const BioPage = () => {
  const handleSuccess = (bio: Bio) => {
    console.log("Bio operation successful:", bio);
    // You can add any additional success handling here
    // For example, showing a success toast, redirecting, etc.
  };

  const handleError = (error: string) => {
    console.error("Bio operation failed:", error);
    // You can add any additional error handling here
    // For example, showing an error toast
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bio Management</h1>
          <p className="text-muted-foreground">
            Manage your professional bio information
          </p>
        </div>
        <BioFormWrapper onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
};

export default BioPage;
