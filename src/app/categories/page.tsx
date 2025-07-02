"use client";

import "../globals.css";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useList, type BaseRecord } from "@refinedev/core";
import { Card, Avatar, Tag, Space, Table, Spin } from "antd";
import { useEffect } from "react";


export default function ExperienceList() {

  useEffect(() => {
    // Fetch experiences from the API
    const fetchExperiences = async () => {
      try {
        const response = await fetch(
          "http://localhost:8787/",
          {
            method: "GET",
            credentials: "include", // Include credentials (cookies, etc.)
          }
        );
        console.log("Response:", response);
        if (!response.ok) {
          console.error("Failed to fetch experiences:", response.statusText);
          throw new Error("Failed to fetch experiences");
        }

        const data = await response.json();
        console.log("Fetched experiences:", data);
      } catch (error) {
        console.error("Error fetching experiences:", error);
    }
    };

    fetchExperiences();
  }, []);
  
  // Fetch experiences from the backend using the `useList` hook from Refine
  const { data, isLoading } = useList({
    resource: "experiences",
  });

  const experiences = data?.data || [];

  if (isLoading) {
    return <Spin size="large" className="flex justify-center mt-20" />;
  }

  return (
    <List>

<div className="flex flex-col gap-4">
      {experiences.map((experience) => (
        <Card
          key={experience.id}
          className="shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-start">
            {/* Company Logo */}
            <Avatar
              src={experience.img}
              size={64}
              className="mb-4 mr-4"
              alt={`${experience.company} Logo`}
            />

            {/* Experience Details */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                {/* Role */}
                <h3 className="font-semibold text-xl">{experience.role}</h3>
                {/* Date */}
                <span className="text-gray-500">{experience.date}</span>
              </div>

              {/* Company Name */}
              <p className="text-gray-600">{experience.company}</p>

              {/* Description */}
              <p className="text-gray-700 mt-4">{experience.desc}</p>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {experience.skills?.map((skill: string, index: number) => (
                  <Tag key={index} color="blue">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <Space className="ml-4">
              <EditButton hideText size="small" recordItemId={experience.id} />
              <ShowButton hideText size="small" recordItemId={experience.id} />
              <DeleteButton hideText size="small" recordItemId={experience.id} />
            </Space>
          </div>
        </Card>
      ))}
    </div>
    </List>
  );
}
