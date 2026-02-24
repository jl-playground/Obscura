import type { ChildProcess } from 'node:child_process';

export interface ForkPayload<T = unknown> {
  identifier: string;
  body: T;
}

export interface WorkerResult<T = unknown> {
  status: boolean;
  code: number;
  message: string;
  detail?: string;
  content?: T;
}

export type ActiveWorker = Set<ChildProcess>;

export interface WorkerConfig {
  redisUrl: string;
  batchSize: number;
  intervalMs: number;
}

export interface ForkMessage {
  identifier: string;
  body: WorkerConfig;
}
