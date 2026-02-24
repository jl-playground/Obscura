import { fork } from 'node:child_process';
import path from 'node:path';

import type { ForkPayload, WorkerResult } from './types';
import type { ChildProcess } from 'node:child_process';

const isTsEnv = process.argv.some((arg) => arg.includes('ts-node') || arg.endsWith('.ts')); // Simple check to determine if we're running in a TypeScript environment

export default class ForkService {
  private static instance: ForkService;

  private workersDir: string;

  private activeWorkers = new Set<ChildProcess>();

  private constructor() {
    this.workersDir = path.join(process.cwd(), isTsEnv ? 'src/core/forks/fork' : 'src/dist/core/forks/fork');
    process.on('exit', () => this.killAll());
  }

  public static getInstance(): ForkService {
    if (!ForkService.instance) ForkService.instance = new ForkService();
    return ForkService.instance;
  }

  // @ts-expect-error - Generic method to run any worker by name
  private async runWorker<TResponse = unknown, TPayload = unknown>(
    workerName: string,
    payload?: TPayload,
    identifier = 'worker-process',
  ): Promise<WorkerResult<TResponse>> {
    return new Promise((resolve, reject) => {
      const extension = isTsEnv ? '.ts' : '.js';
      const workerFileName = workerName.endsWith(extension) ? workerName : `${workerName}${extension}`;
      const workerPath = path.join(this.workersDir, workerFileName);

      const options = {
        execArgv: isTsEnv ? ['--import', 'tsx'] : undefined,
      };

      console.log(`[ForkService] Spawning ${identifier} at ${workerPath}`);
      const child: ChildProcess = fork(workerPath, [], options);

      this.activeWorkers.add(child);

      const data: ForkPayload<TPayload | undefined> = {
        identifier,
        body: payload,
      };

      let isDone = false;

      const cleanup = () => {
        if (!child.killed) child.kill();
        this.activeWorkers.delete(child);
        isDone = true;
      };

      child.on('message', (result: WorkerResult<TResponse>) => {
        if (isDone) return;
        cleanup();
        resolve(result);
      });

      child.on('error', (error) => {
        if (isDone) return;
        console.error(`[ForkService] Error in ${identifier}:`, error);
        cleanup();
        reject(new Error(error.message));
      });

      child.on('exit', (code) => {
        if (isDone) return;
        cleanup();
        if (code !== 0) reject(new Error(`Worker ${identifier} exited with code ${code}`));
      });

      child.send(data);
    });
  }

  // --- Public Methods ---
  // Example method to launch a specific worker (e.g. databaseWorker)
  // public async launchDatabaseWorker(payload?: unknown): Promise<WorkerResult> {
  //   return this.runWorker('databaseWorker', payload, 'database-worker');
  // }

  public killAll(): void {
    for (const worker of this.activeWorkers) {
      if (!worker.killed) worker.kill();
    }
    this.activeWorkers.clear();
  }
}
