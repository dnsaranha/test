import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMediaSettings } from "@/hooks/useMediaSettings";

// Interfaces
interface MediaSettingsProps {
  onReload: () => void;
  isLoading: boolean;
}

const MediaSettings: React.FC<MediaSettingsProps> = ({
  onReload,
  isLoading
}) => {
  const { 
    sources, 
    addSource, 
    updateSource, 
    removeSource, 
    removeDuplicates, 
    setRemoveDuplicates,
    loading,
    user
  } = useMediaSettings();
  
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  // Função para adicionar nova fonte
  const handleAddSource = async () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      return;
    }

    try {
      new URL(newSourceUrl);
    } catch {
      alert("URL inválida. Por favor, insira uma URL válida.");
      return;
    }

    const success = await addSource({
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      enabled: true
    });

    if (success) {
      setNewSourceName("");
      setNewSourceUrl("");
    }
  };

  // Função para alternar estado da fonte
  const toggleSource = async (id: string, enabled: boolean) => {
    await updateSource(id, { enabled: !enabled });
  };

  // Função para atualizar nome da fonte
  const updateSourceName = async (id: string, name: string) => {
    await updateSource(id, { name });
  };

  // Função para atualizar URL da fonte
  const updateSourceUrl = async (id: string, url: string) => {
    await updateSource(id, { url });
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configurações Gerais</CardTitle>
          <CardDescription>
            Configure as opções gerais de carregamento de mídia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="remove-duplicates">Remover canais duplicados</Label>
              <p className="text-sm text-muted-foreground">
                Remove automaticamente canais com URLs idênticas
              </p>
            </div>
            <Switch
              id="remove-duplicates"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={onReload}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isLoading ? "Recarregando..." : "Recarregar Listas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Listas M3U */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Listas M3U</CardTitle>
          <CardDescription>
            Gerencie suas listas de canais M3U e XML
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar nova lista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="space-y-2">
              <Label htmlFor="source-name">Nome da Lista</Label>
              <Input
                id="source-name"
                placeholder="Ex: Canais Brasileiros"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">URL da Lista</Label>
              <Input
                id="source-url"
                placeholder="https://exemplo.com/lista.m3u"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleAddSource}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lista
              </Button>
            </div>
          </div>

          {/* Lista de fontes existentes */}
          <div className="space-y-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <Switch
                  checked={source.enabled}
                  onCheckedChange={() => toggleSource(source.id!, source.enabled)}
                />
              
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={source.name}
                    onBlur={(e) => updateSourceName(source.id!, e.target.value)}
                    placeholder="Nome da lista"
                  />
                  <Input
                    value={source.url}
                    onBlur={(e) => updateSourceUrl(source.id!, e.target.value)}
                    placeholder="URL da lista"
                  />
                </div>
              
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSource(source.id!)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {sources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma lista M3U configurada</p>
                <p className="text-sm">Adicione uma lista usando o formulário acima</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { MediaSettings };