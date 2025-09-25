
import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParsedMovie } from "@/services/movieRepositories";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=cover&w=400&q=80";

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Receber dados do filme do state da navegação
  const movieFromState = location.state?.movie as ParsedMovie;
  const streamUrl = location.state?.streamUrl as string;
  
  const [movie, setMovie] = React.useState<ParsedMovie | null>(movieFromState || null);
  const [loading, setLoading] = React.useState(!movieFromState);

  React.useEffect(() => {
    if (!movieFromState && id) {
      // Se não temos dados do state, criar dados básicos
      setMovie({
        id: id,
        title: `Filme ${id}`,
        poster: FALLBACK_IMAGE,
        year: 2024,
        genre: ["Filme"],
        repository: "Desconhecido"
      });
      setLoading(false);
    }
  }, [id, movieFromState]);

  const handleWatchMovie = () => {
    if (streamUrl) {
      // Abrir stream em nova aba
      window.open(streamUrl, '_blank');
    } else {
      alert('Link de streaming não disponível para este filme.');
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando detalhes...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!movie) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <div className="text-center py-20">
              <p>Filme não encontrado.</p>
              <Button 
                onClick={() => navigate('/')}
                className="mt-4"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </Button>
          
          <div className="max-w-6xl mx-auto bg-card rounded shadow p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8">
              <img
                src={movie.poster || FALLBACK_IMAGE}
                alt={movie.title}
                className="w-full lg:w-80 rounded-lg object-cover bg-muted"
                onError={(e) => ((e.currentTarget.src = FALLBACK_IMAGE))}
              />
              <div className="flex flex-col gap-4 flex-1">
                <CardTitle className="text-3xl mb-2">{movie.title}</CardTitle>
                <p className="font-semibold text-muted-foreground text-lg">
                  {movie.year}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre?.map((g, index) => (
                    <span
                      key={index}
                      className="text-sm bg-muted px-3 py-1 rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-blue-500">
                    Fonte: {movie.repository}
                  </p>
                </div>
                
                {streamUrl && (
                  <div className="mt-6">
                    <Button 
                      onClick={handleWatchMovie}
                      className="w-full lg:w-auto"
                      size="lg"
                    >
                      🎬 Assistir Agora
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      O filme será aberto em uma nova aba
                    </p>
                  </div>
                )}
                
                <CardContent className="p-0 mt-6">
                  <h2 className="font-bold mb-3 text-xl">Sobre o Filme</h2>
                  <p className="text-base leading-relaxed">
                    Este filme está disponível através do repositório {movie.repository}. 
                    Para mais informações e qualidade do conteúdo, utilize o botão "Assistir Agora" acima.
                  </p>
                </CardContent>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MovieDetail;
