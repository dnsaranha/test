import { useState, useEffect, useMemo } from "react";
import { m3uSourcesService, type M3USource, type UserSettings } from "@/services/m3uSourcesService";
import { useAuth } from "./useAuth";

export const useMediaSettings = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState<M3USource[]>([]);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do banco de dados
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [sourcesData, settingsData] = await Promise.all([
          m3uSourcesService.getSources(),
          m3uSourcesService.getSettings()
        ]);
        
        setSources(sourcesData);
        if (settingsData) {
          setRemoveDuplicates(settingsData.remove_duplicates);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Salvar fontes no banco de dados
  const saveSources = async (newSources: M3USource[]) => {
    setSources(newSources);
  };

  // Adicionar nova fonte
  const addSource = async (source: Omit<M3USource, 'id'>): Promise<M3USource | null> => {
    const newSource = await m3uSourcesService.createSource(source);
    if (newSource) {
      setSources(prev => [...prev, newSource]);
    }
    return newSource;
  };

  // Atualizar fonte existente
  const updateSource = async (id: string, updates: Partial<M3USource>): Promise<M3USource | null> => {
    const updatedSource = await m3uSourcesService.updateSource(id, updates);
    if (updatedSource) {
      setSources(prev => prev.map(source => 
        source.id === id ? updatedSource : source
      ));
    }
    return updatedSource;
  };

  // Remover fonte
  const removeSource = async (id: string): Promise<boolean> => {
    const success = await m3uSourcesService.deleteSource(id);
    if (success) {
      setSources(prev => prev.filter(source => source.id !== id));
    }
    return success;
  };

  // Salvar configuração de remover duplicatas
  const saveRemoveDuplicates = async (value: boolean) => {
    setRemoveDuplicates(value);
    await m3uSourcesService.updateSettings({ remove_duplicates: value });
  };

  // Obter URLs das fontes ativas
  const getActiveSources = useMemo(() => {
    return sources.filter(source => source.enabled).map(source => source.url);
  }, [sources]);

  return {
    sources,
    setSources: saveSources,
    addSource,
    updateSource,
    removeSource,
    removeDuplicates,
    setRemoveDuplicates: saveRemoveDuplicates,
    getActiveSources,
    loading,
    user
  };
};