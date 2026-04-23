declare module 'ssh2' {
  import { EventEmitter } from 'events';
  export interface ConnectConfig { host?: string; port?: number; username?: string; password?: string; privateKey?: string | Buffer; passphrase?: string; keepaliveInterval?: number; keepaliveCountMax?: number; readyTimeout?: number; hostVerifier?: (key: any) => boolean; [k: string]: any; }
  export class Client extends EventEmitter { connect(config: ConnectConfig): void; end(): void; forwardOut(srcIP: string, srcPort: number, dstIP: string, dstPort: number, cb: (err: Error | undefined, stream: any) => void): void; shell(opts: any, cb: (err: Error | undefined, stream: any) => void): void; }
}
