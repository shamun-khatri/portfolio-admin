"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  // On route change, open only the active parent submenu by default.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((it) => {
      if (it.items?.length) {
        const key = normalize(it.url);
  const active = pathname === key || pathname.startsWith(key + "/");
  if (active) {
          next[key] = true; // auto-open current tab's submenu
        }
      }
    });
    setOpenKeys(next);
  }, [pathname, items]);

  const normalize = (u: string) => (u?.startsWith("/") ? u : `/${u}`);
  const isActive = (path: string, href: string) => {
    const h = normalize(href);
    // exact or nested route
    return path === h || path.startsWith(h + "/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemUrl = normalize(item.url);
          const hasChildren = !!item.items?.length;
          const anySubActive = hasChildren
            ? item.items!.some((s) => isActive(pathname, s.url))
            : false;
          const itemActive = isActive(pathname, itemUrl) || anySubActive;
          const key = itemUrl;
          // Auto-open when a child is active; otherwise rely on manual toggle state.
          const open = hasChildren && (!!openKeys[key] || anySubActive);

          return (
            <Collapsible
              key={item.title}
              asChild
              open={open}
              onOpenChange={(o) => setOpenKeys((prev) => ({ ...prev, [key]: o }))}
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={itemActive}>
                  <a href={itemUrl}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items!.map((subItem) => {
                          const subActive = isActive(pathname, subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={subActive}>
                                <a href={normalize(subItem.url)}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
