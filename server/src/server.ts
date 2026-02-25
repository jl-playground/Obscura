// import cookieParser from 'cookie-parser';
import express from 'express';
// import helmet from 'helmet';
// import morgan from 'morgan';

// import SSOAuthenticationMiddleware from '@/app/core/middlewares/SSOAuthenticationMiddleware';
import Routes from '@/app/core/routes';

import type { Application } from 'express';

export default class Server {
  // Static Properties
  private static instance: Server;

  // Readonly Properties
  private readonly serviceName: string = 'Server';

  // Properties
  public app: Application;

  private port: number;

  // private bodyLimit = '500mb';

  private constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initialize();
  }

  // Static Methods
  public static getInstance(port?: number): Server {
    if (!Server.instance) Server.instance = new Server(port ?? 3000);
    return Server.instance;
  }

  // Public Methods
  /**
   * Start the server
   */
  public start(): void {
    try {
      this.app.listen(this.port, () => {
        console.log('\x1b[36m', `Obscrua started on port ${this.port}`, '\x1b[0m');
      });
    } catch (error) {
      console.error(`[Error] in ${this.serviceName} listen:`, error);
    }
  }

  // Private Methods
  private initialize(): void {
    try {
      // this.initializeSecurity();

      // SSO Middleware
      // SSOAuthenticationMiddleware.getInstance(this.app);

      this.initializeMiddlewares();

      // Routes
      Routes.getInstance(this.app);
    } catch (error) {
      console.error(`[Error] in ${this.serviceName} initialize:`, error);
    }
  }

  /**
   * Initialize Basic Security Headers
   * Removed CSP and complex browser directives as this is S2S.
   */
  // private initializeSecurity(): void {
  //   this.app.disable('x-powered-by');
  //   this.app.use(helmet.hidePoweredBy());
  //   this.app.use(helmet.frameguard({ action: 'deny' }));
  //   this.app.use(helmet.xssFilter());
  //   this.app.use(helmet.noSniff());
  // }

  /**
   * Initialize standard middlewares (Morgan, BodyParser, CookieParser)
   */
  private initializeMiddlewares(): void {
    // this.app.use(morgan('combined'));
    this.app.use(express.urlencoded({ limit: '500mb', extended: true }));
    this.app.use(express.json({ limit: '500mb' }));
    // this.app.use(cookieParser());
  }

  // Getters and Setters
  public get ServiceName(): string {
    return this.serviceName;
  }

  public get App(): Application {
    return this.app;
  }
}
