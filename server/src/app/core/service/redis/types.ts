import type { MobileClientData } from '@/features/vendors/mobile/types';
import type { QueclinkReport } from '@/features/vendors/queclink/types';
import type { SpotPilotRecord } from '@/features/vendors/spotpilot/types';
import type { TeltonikaAvlRecord } from '@/features/vendors/teltonika/types';

export interface RedisTrackerReponsePayload {
  imei: string;
  status?: 'connected' | 'disconnected';
  connectedAt?: Date;
  disconnectedAt?: Date;
  records?: TeltonikaAvlRecord[] | SpotPilotRecord[] | QueclinkReport[] | MobileClientData[];
}
