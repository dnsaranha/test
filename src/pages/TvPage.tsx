
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const TvPage = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 p-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold mb-6">TV Online</h1>
        <div className="p-8 bg-muted rounded text-muted-foreground text-center">
          Em breve: integração com streams de TV ao vivo!
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default TvPage;
