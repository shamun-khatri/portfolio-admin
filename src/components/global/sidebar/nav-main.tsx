"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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
  const splitHref = (href: string) => {
    const normalized = normalize(href);
    const [path, queryString = ""] = normalized.split("?");
    return { path, queryString };
  };

  const isActive = (path: string, href: string) => {
    const { path: hrefPath, queryString } = splitHref(href);
    const pathMatch = path === hrefPath || path.startsWith(hrefPath + "/");

    if (!pathMatch) return false;
    if (!queryString) return true;

    const hrefParams = new URLSearchParams(queryString);

    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) {
        return false;
      }
    }

    return true;
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
              onOpenChange={(o) =>
                setOpenKeys((prev) => ({ ...prev, [key]: o }))
              }
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={itemActive}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-primary/8 hover:text-sidebar-primary-foreground transition-colors`}
                >
                  <a href={itemUrl} className="flex items-center gap-3">
                    <item.icon className="opacity-90" />
                    <span className="truncate">{item.title}</span>
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
                              <SidebarMenuSubButton
                                asChild
                                isActive={subActive}
                                className="pl-8 pr-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-primary/6 hover:text-sidebar-primary-foreground transition-colors"
                              >
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
