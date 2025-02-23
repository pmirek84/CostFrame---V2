import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase configuration');
}

// Create Supabase client with custom fetch handler and error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error('Supabase fetch error:', err);
        throw new Error('Failed to connect to the database. Using local storage fallback.');
      });
    }
  }
});

// Helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return false;
    }

    // Then check if we can access the database
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful', { session: !!session });
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Helper function to get data with fallback
export const getDataWithFallback = async <T>(
  tableName: string, 
  storageKey: string,
  defaultValue: T[] = []
): Promise<T[]> => {
  try {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    // Try Supabase first
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // If successful, update local storage and return data
    if (data) {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return data;
    }

    throw new Error('No data received from Supabase');
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    console.log('Falling back to local storage...');
    
    // Fallback to local storage
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If no local data, return default value
    return defaultValue;
  }
};

// Helper function to save data with fallback
export const saveDataWithFallback = async <T extends { id?: string }>(
  tableName: string,
  storageKey: string,
  data: T,
  isUpdate = false
): Promise<T> => {
  try {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    // Try Supabase first
    const { data: savedData, error } = isUpdate 
      ? await supabase
          .from(tableName)
          .update(data)
          .eq('id', data.id)
          .select()
          .single()
      : await supabase
          .from(tableName)
          .insert(data)
          .select()
          .single();

    if (error) throw error;
    if (!savedData) throw new Error('No data returned from save operation');

    // Update local storage
    const storedData = localStorage.getItem(storageKey);
    const currentData = storedData ? JSON.parse(storedData) : [];
    
    if (isUpdate) {
      const updatedData = currentData.map((item: T) => 
        item.id === data.id ? savedData : item
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } else {
      localStorage.setItem(storageKey, JSON.stringify([...currentData, savedData]));
    }

    return savedData;
  } catch (error) {
    console.error(`Error saving to ${tableName}:`, error);
    console.log('Falling back to local storage...');
    
    // Fallback to local storage
    const storedData = localStorage.getItem(storageKey);
    const currentData = storedData ? JSON.parse(storedData) : [];
    
    // Generate ID if needed
    const dataToSave = {
      ...data,
      id: data.id || crypto.randomUUID()
    };

    if (isUpdate) {
      const updatedData = currentData.map((item: T) => 
        item.id === dataToSave.id ? dataToSave : item
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } else {
      localStorage.setItem(storageKey, JSON.stringify([...currentData, dataToSave]));
    }

    return dataToSave;
  }
};

// Helper function to delete data with fallback
export const deleteDataWithFallback = async (
  tableName: string,
  storageKey: string,
  id: string
): Promise<void> => {
  try {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    // Try Supabase first
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update local storage
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const currentData = JSON.parse(storedData);
      const updatedData = currentData.filter((item: any) => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    console.log('Falling back to local storage...');
    
    // Fallback to local storage
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const currentData = JSON.parse(storedData);
      const updatedData = currentData.filter((item: any) => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }
  }
};

// Storage keys constants
export const STORAGE_KEYS = {
  CLIENTS: 'costframe_clients',
  OFFERS: 'costframe_offers',
  EVENTS: 'costframe_events'
};