"use client";

import * as React from "react";
import {
  BookOpen,
  BrainCircuit,
  Command,
  GraduationCap,
  Projector,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  navMain: [
    {
      title: "Bio",
      url: "/bio",
      icon: User,
      isActive: true,
    },
    {
      title: "Skills",
      url: "/skills",
      icon: BrainCircuit,
      isActive: true,
      items: [
        {
          title: "Create",
          url: "/skills/create",
        },
      ],
    },
    {
      title: "Experience",
      url: "/experience",
      icon: BookOpen,
      items: [
        {
          title: "Create",
          url: "/experience/create",
        },
      ],
    },
    {
      title: "project",
      url: "/project",
      icon: Projector,
      items: [
        {
          title: "Create",
          url: "/project/create",
        },
      ],
    },
    {
      title: "education",
      url: "/education",
      icon: GraduationCap,
      items: [
        {
          title: "Create",
          url: "/education/create",
        },
      ],
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Support",
  //     url: "#",
  //     icon: LifeBuoy,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "#",
  //     icon: Send,
  //   },
  // ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg sidebar-logo">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Portfolio</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {session?.user && (
        <SidebarFooter>
          <NavUser
            user={{
              name: session.user.name || "User",
              email: session.user.email || "",
              avatar: session.user.image || "/avatars/default.jpg",
            }}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
