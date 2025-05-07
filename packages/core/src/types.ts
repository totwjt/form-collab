// Add your type definitions here
export interface Config {
  // Add your configuration types here
}

export interface Options {
  // Add your options types here
}

export type Theme = 'light' | 'dark'

export interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

export interface AppConfig {
  apiUrl: string
  timeout: number
}

export interface FormData {
  [key: string]: any;
}

export interface FormUser {
  id: string;
  name: string;
}

export interface FormMessage {
  type: 'update' | 'lock' | 'unlock' | 'error';
  data: {
    field?: string;
    value?: any;
    user?: FormUser;
    error?: string;
  };
}

export interface FormState {
  data: FormData;
  lockedFields: Map<string, FormUser>;
  users: Map<string, FormUser>;
}
