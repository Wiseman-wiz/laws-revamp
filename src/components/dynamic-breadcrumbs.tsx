"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCaseTypeBySlug, getCaseTypeById } from "@/app/actions/case-types";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href: string; isCurrent: boolean }[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const paths = pathname.split("/").filter((path) => path !== "");
      const crumbs: { label: string; href: string; isCurrent: boolean }[] = [];

      // Always start with Dashboard if we're in an authenticated route
      crumbs.push({ label: "Dashboard", href: "/dashboard", isCurrent: pathname === "/dashboard" });

      let currentHref = "";

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        // Skip 'dashboard' as we added it manually
        if (path === "dashboard") continue;

        currentHref += `/${path}`;
        const isLast = i === paths.length - 1;

        let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

        // Custom labels for specific routes
        if (path === "case-types") label = "Case Types";
        if (path === "cases") label = "Cases";
        if (path === "new") label = "New";
        if (path === "edit") label = "Edit";

        // Try to fetch real name for dynamic segments
        if (i > 0) {
          const prevPath = paths[i - 1];
          if (prevPath === "cases") {
            try {
              const caseType = await getCaseTypeBySlug(path);
              if (caseType) label = caseType.name;
            } catch {
              // Ignore fetch errors
            }
          } else if (prevPath === "case-types" && path !== "new") {
            try {
              const caseType = await getCaseTypeById(path);
              if (caseType) label = caseType.name;
            } catch {
              // Ignore fetch errors
            }
          }
        }

        crumbs.push({
          label,
          href: currentHref,
          isCurrent: isLast,
        });
      }

      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [pathname]);

  if (breadcrumbs.length <= 1 && pathname === "/dashboard") {
     return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
     );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isCurrent ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
