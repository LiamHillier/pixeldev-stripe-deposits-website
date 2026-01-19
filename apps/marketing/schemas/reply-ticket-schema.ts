import { z } from 'zod';

export const replyTicketSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message must be less than 5000 characters')
});

export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
