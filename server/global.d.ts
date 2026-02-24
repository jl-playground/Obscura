declare module '*.hbs' {
  const content: string;
  export default content;
}
declare module '*.html' {
  const content: string;
  export default content;
}

declare module '*/config/config.cjs' {
  import type { Options } from 'sequelize';

  export interface DbConfig extends Options {
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: string | number;
    dialect: 'postgres';
    use_env_variable?: string;
    [key: string]: any; // Add this line
  }

  interface ConfigFile {
    local: DbConfig;
    development: DbConfig;
    test: DbConfig;
    production: DbConfig;
    [key: string]: DbConfig;
  }

  const config: ConfigFile;
  export default config;
}
