import { z } from 'zod';

export const socketMonitorParamsSchema = z.object({
  socketId: z.string().trim().min(1).max(128),
});
