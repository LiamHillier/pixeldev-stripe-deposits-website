import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string()
    },
    runtimeEnv: {
      AUTH_SECRET: process.env.AUTH_SECRET
    }
  });
