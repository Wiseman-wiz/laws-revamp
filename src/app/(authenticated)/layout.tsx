import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/auth";
import { getCaseTypes } from "@/app/actions/case-types";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const caseTypes = await getCaseTypes();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session.user} caseTypes={caseTypes} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumbs />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 w-full max-w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
