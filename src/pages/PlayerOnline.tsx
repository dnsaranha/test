
import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";

const PlayerOnline: React.FC = () => {
  const [link, setLink] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaying(link);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold mb-6">Assistir via Link Direto</h1>
          <form className="mb-6 flex flex-col gap-2 max-w-lg" onSubmit={handlePlay}>
            <label htmlFor="link" className="font-medium">
              Cole aqui o link direto do vídeo (.mp4, .m3u8 ou embed):
            </label>
            <Input
              id="link"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Ex: https://site.com/stream.m3u8"
            />
            <Button type="submit" disabled={!link.trim()}>Assistir</Button>
          </form>
          {playing && (
            <div>
              <VideoPlayer src={playing} />
            </div>
          )}
          <div className="mt-6 text-xs text-muted-foreground">
            Dica: Você pode pegar links em sites como SuperFlix, Animes Vision, Goyabu ou playlists m3u8 de repositórios públicos.<br />
            Caso queira integração automática, será necessário backend.
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PlayerOnline;
