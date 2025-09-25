import { supabase } from '@/integrations/supabase/client';

export interface M3USource {
  id?: string;
  name: string;
  url: string;
  enabled: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  remove_duplicates: boolean;
  created_at?: string;
  updated_at?: string;
}

export const m3uSourcesService = {
  // CRUD para M3U Sources
  async getSources(): Promise<M3USource[]> {
    try {
      const { data, error } = await supabase
        .from('m3u_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar sources:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro de conexão ao buscar sources:', error);
      return [];
    }
  },

  async createSource(source: Omit<M3USource, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<M3USource | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('m3u_sources')
        .insert({
          ...source,
          user_id: user?.id || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar source:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro de conexão ao criar source:', error);
      return null;
    }
  },

  async updateSource(id: string, updates: Partial<M3USource>): Promise<M3USource | null> {
    try {
      const { data, error } = await supabase
        .from('m3u_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar source:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro de conexão ao atualizar source:', error);
      return null;
    }
  },

  async deleteSource(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('m3u_sources')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar source:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro de conexão ao deletar source:', error);
      return false;
    }
  },

  // CRUD para User Settings
  async getSettings(): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return { remove_duplicates: true };
      }
      
      if (!data) {
        // Criar configurações padrão
        return this.createSettings({ remove_duplicates: true });
      }
      
      return data;
    } catch (error) {
      console.error('Erro de conexão ao buscar configurações:', error);
      return { remove_duplicates: true };
    }
  },

  async createSettings(settings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          ...settings,
          user_id: userId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar configurações:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro de conexão ao criar configurações:', error);
      return null;
    }
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Primeiro tentar atualizar
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        return null;
      }

      if (!data) {
        // Se não existir, criar novo
        return this.createSettings({ remove_duplicates: true, ...updates });
      }
      
      return data;
    } catch (error) {
      console.error('Erro de conexão ao atualizar configurações:', error);
      return null;
    }
  }
};