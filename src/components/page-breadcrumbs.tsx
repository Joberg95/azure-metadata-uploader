"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProcessedSegment {
  segment: string;
  href: string;
  isLast: boolean;
}

export default function PageBreadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbElements = [];

  breadcrumbElements.push(
    <BreadcrumbItem key="home">
      <BreadcrumbLink asChild>
        <Link href="/dashboard/documents">Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  );

  if (pathSegments.length > 0) {
    breadcrumbElements.push(<BreadcrumbSeparator key="home-separator" />);
  }

  const processedSegments: ProcessedSegment[] = [];

  pathSegments.forEach((segment, index) => {
    if (segment === "dashboard") return;

    processedSegments.push({
      segment,
      href:
        segment === pathSegments[1] && pathSegments[0] === "dashboard"
          ? `/dashboard/${segment}`
          : `/${pathSegments.slice(0, index + 1).join("/")}`,
      isLast: index === pathSegments.length - 1,
    });
  });

  processedSegments.forEach((item, index) => {
    const formattedSegment =
      item.segment.charAt(0).toUpperCase() + item.segment.slice(1);

    breadcrumbElements.push(
      <BreadcrumbItem key={item.href}>
        {item.isLast ? (
          <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link href={item.href}>{formattedSegment}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );

    if (index < processedSegments.length - 1) {
      breadcrumbElements.push(
        <BreadcrumbSeparator key={`${item.href}-separator`} />
      );
    }
  });

  return (
    <div className="px-4 py-2 border-b">
      <Breadcrumb>
        <BreadcrumbList>{breadcrumbElements}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
