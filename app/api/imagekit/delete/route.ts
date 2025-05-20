import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function DELETE(req: NextRequest) {
  try {
    // Get file ID from query parameter
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Check for required environment variables
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('ImageKit credentials missing:', {
        publicKey: !!publicKey,
        privateKey: !!privateKey,
        urlEndpoint: !!urlEndpoint,
      });

      return NextResponse.json({ error: 'ImageKit configuration missing' }, { status: 500 });
    }

    // Create a new instance for each request to avoid initialization errors
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Delete the file
    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);

    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
