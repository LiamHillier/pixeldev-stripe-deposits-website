import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

type RouteParams = {
  params: Promise<{
    attachmentId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { attachmentId } = await params;

    // Get hash from query params for cache validation
    const searchParams = request.nextUrl.searchParams;
    const requestedHash = searchParams.get('v');

    // Find the attachment
    const attachment = await prisma.supportTicketMessageAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        data: true,
        contentType: true,
        filename: true,
        hash: true,
        size: true
      }
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Validate hash if provided (prevents guessing attachment IDs)
    if (requestedHash && requestedHash !== attachment.hash) {
      return NextResponse.json(
        { error: 'Invalid attachment hash' },
        { status: 403 }
      );
    }

    // Return the attachment with appropriate headers
    return new NextResponse(attachment.data, {
      status: 200,
      headers: {
        'Content-Type': attachment.contentType,
        'Content-Length': attachment.size.toString(),
        'Content-Disposition': `inline; filename="${attachment.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${attachment.hash}"`
      }
    });
  } catch (error) {
    console.error('[TICKET ATTACHMENT] Error serving attachment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
