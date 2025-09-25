import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProvider } from '@/contexts/MediaContext';
import Index from "./pages/Index";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import MovieDetail from "./pages/MovieDetail";
import TvPage from "./pages/TvPage";
import FilmesPage from "./pages/FilmesPage";
import SeriesPage from "./pages/SeriesPage";
import NotFound from "./pages/NotFound";
import TvOnlinePage from "./pages/TvOnlinePage";
import PlayerOnline from "./pages/PlayerOnline";
import EnhancedPlayerPage from "./pages/EnhancedPlayerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MediaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/filme/:id" element={<MovieDetail />} />
            <Route path="/tv" element={<TvPage />} />
            <Route path="/tv-online" element={<TvOnlinePage />} />
            <Route path="/player" element={<EnhancedPlayerPage />} />
            <Route path="/player-simple" element={<PlayerOnline />} />
            <Route path="/filmes" element={<FilmesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MediaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
