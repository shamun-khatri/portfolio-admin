"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

const TopBarBreadcrumb = () => {
  const path = usePathname();
  const pathParts = path.split("/").filter(Boolean);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          {path !== "/dashboard" ? (
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Home</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {path !== "/dashboard" && (
          <BreadcrumbSeparator className="hidden md:block" />
        )}
        {path !== "/dashboard" &&
          pathParts.map((part, index) => {
            const href = "/" + pathParts.slice(0, index + 1).join("/");
            const isLast = index === pathParts.length - 1;

            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
              >
                {" "}
                <BreadcrumbItem className="hidden md:block">
                  {isLast ? (
                    <BreadcrumbPage>{capitalize(part)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {capitalize(part)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </div>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default TopBarBreadcrumb;
