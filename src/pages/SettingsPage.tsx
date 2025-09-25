import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MediaSettings } from "@/components/MediaSettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaContext } from "@/contexts/MediaContext";

const SettingsPage: React.FC = () => {
  const { reloadMedia, loading } = useMediaContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ⚙️ Configurações
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas listas M3U e configurações de carregamento
            </p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <MediaSettings
              onReload={reloadMedia}
              isLoading={loading}
            />
          </ScrollArea>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;