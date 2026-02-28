"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CaseType } from "@/types/case";

interface DynamicBreadcrumbsProps {
  caseTypes: CaseType[];
}

export function DynamicBreadcrumbs({ caseTypes }: DynamicBreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter((path) => path !== "");
    const crumbs: { label: string; href: string; isCurrent: boolean }[] = [];

    // Always start with Dashboard
    crumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isCurrent: pathname === "/dashboard"
    });

    let currentHref = "";

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (path === "dashboard") continue;

      currentHref += `/${path}`;
      const isLast = i === paths.length - 1;

      let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

      // Static overrides
      if (path === "case-types") label = "Case Types";
      if (path === "cases") label = "Cases";
      if (path === "new") label = "New";
      if (path === "edit") label = "Edit";

      // Synchronous resolution from pre-fetched caseTypes
      if (i > 0) {
        const prevPath = paths[i - 1];
        if (prevPath === "cases") {
          const caseType = caseTypes.find(ct => ct.slug === path);
          if (caseType) label = caseType.name;
        } else if (prevPath === "case-types" && path !== "new") {
          const caseType = caseTypes.find(ct => ct._id?.toString() === path);
          if (caseType) label = caseType.name;
        }
      }

      crumbs.push({
        label,
        href: currentHref,
        isCurrent: isLast,
      });
    }

    return crumbs;
  }, [pathname, caseTypes]);

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
