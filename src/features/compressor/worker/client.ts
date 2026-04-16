// ═══════════════════════════════════════════════════
// worker/client — Promise-friendly wrapper around the compressor worker.
//
// Lazily spins up a single shared Worker instance on first use. Jobs are
// dispatched by uuid so concurrent requests don't collide.
// ═══════════════════════════════════════════════════

import type { OutputFormat, WorkerRequest, WorkerResponse } from '../types';
import CompressorWorker from './compressor.worker.ts?worker';

interface CompressResult {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

type Pending = {
  resolve: (result: CompressResult) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
const pending = new Map<string, Pending>();

function getWorker(): Worker {
  if (worker) return worker;

  const instance = new CompressorWorker();
  instance.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const data = event.data;
    const job = pending.get(data.id);
    if (!job) return;
    pending.delete(data.id);
    if (data.ok) {
      job.resolve({ buffer: data.buffer, width: data.width, height: data.height });
    } else {
      job.reject(new Error(data.error));
    }
  });

  instance.addEventListener('error', event => {
    const message = event.message || 'Worker error';
    for (const job of pending.values()) job.reject(new Error(message));
    pending.clear();
  });

  worker = instance;
  return instance;
}

export function compressInWorker(
  buffer: ArrayBuffer,
  mime: string,
  format: OutputFormat,
  quality: number,
): Promise<CompressResult> {
  const id = crypto.randomUUID();
  const request: WorkerRequest = { id, buffer, mime, format, quality };

  return new Promise<CompressResult>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    // Transfer the ArrayBuffer to avoid copying large files.
    getWorker().postMessage(request, [buffer]);
  });
}
