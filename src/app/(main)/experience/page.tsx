"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchExperiences = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/experience/111316734788280692226`
  ); // Replace with your API URL
  if (!response.ok) {
    throw new Error("Failed to fetch experiences");
  }
  return response.json();
};

type Experience = {
  img: string;
  role: string;
  company: string;
  date: string;
  desc: string;
  skills: string[];
};

const Page = () => {
  const {
    data: experiences,
    isLoading,
    isError,
  } = useQuery<Experience[]>({
    queryKey: ["experiences"],
    queryFn: fetchExperiences,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Failed to load experiences.</p>;
  }

  console.log("experiences", experiences);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {experiences?.map((experience, index) => (
        <Card
          key={index}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage
                    src={experience.img || "/placeholder.svg"}
                    alt={`${experience.company} logo`}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {experience.company.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {experience.role}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="font-medium">{experience.company}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{experience.date}</span>
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
              {experience.desc}
            </p>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="w-full">
              {experience.skills.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Skills & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No skills listed</p>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Page;
