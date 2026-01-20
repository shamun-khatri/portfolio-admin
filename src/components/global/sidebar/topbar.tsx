import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import TopBarBreadcrumb from "./top-bar-breadcrumb";
import { ModeToggle } from "../toggle-theme";

export const TopBar = () => {
  return (
    <header className="flex sticky top-0 topbar h-16 shrink-0 items-center gap-2 px-4 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <TopBarBreadcrumb />
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
};

export default TopBar;
