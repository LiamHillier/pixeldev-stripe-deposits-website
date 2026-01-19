import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
  Link
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export type SupportTicketMessageEmailProps = {
  appName: string;
  ticketNumber: number;
  subject: string;
  message: string;
  ticketUrl: string;
};

export function SupportTicketMessageEmail({
  appName,
  ticketNumber,
  subject,
  message,
  ticketUrl
}: SupportTicketMessageEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Support Team has replied to your ticket #{String(ticketNumber)}</Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Support Team Reply
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Our support team has replied to your ticket:
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>Ticket #{ticketNumber}:</strong> {subject}
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black whitespace-pre-wrap">
              {message}
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black">
              <Link href={ticketUrl} className="text-blue-600 underline">
                View Full Ticket History
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              You can reply directly to this email to continue the conversation. Your reply will be added to ticket #{ticketNumber}.
            </Text>
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This email was sent by {appName} Support Team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
