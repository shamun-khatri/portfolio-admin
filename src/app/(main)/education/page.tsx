"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type Education = {
  img: string;
  school: string;
  degree: string;
  date: string;
  grade: string;
  desc: string;
};

const EducationPage = () => {
  const session = useSession();
  const {
    data: educationEntries,
    isLoading,
    isError,
  } = useQuery<Education[]>({
    queryKey: ["education", session.data?.user?.id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/education/${session.data?.user?.id}`
      ); // Replace with your API URL
      if (!response.ok) {
        throw new Error("Failed to fetch education entries");
      }
      return response.json();
    },
    enabled: !!session.data?.user?.id,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Failed to load education entries.</p>;
  }

  console.log("educationEntries", educationEntries);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {educationEntries?.map((education, index) => (
        <Card
          key={index}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage
                    src={education.img || "/placeholder.svg"}
                    alt={`${education.school} logo`}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {education.school.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {education.school}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <School className="w-4 h-4 mr-2" />
                    <span className="font-medium">{education.degree}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{education.date}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span className="text-sm font-medium">
                      Grade: {education.grade}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-gray-700 leading-relaxed mb-4">
              {education.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EducationPage;
