export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.lotador.game',
  appName: 'LOTADOR - O Rei da Paragem',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
