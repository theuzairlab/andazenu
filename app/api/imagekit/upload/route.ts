import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Initialize ImageKit with server-side credentials
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('ImageKit credentials missing');
      return NextResponse.json({ error: 'ImageKit credentials missing' }, { status: 500 });
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Process the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = (formData.get('fileName') as string) || `${uuidv4()}-${Date.now()}`;
    const folder = (formData.get('folder') as string) || '/t-shirt-products';

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64data = buffer.toString('base64');

    // Upload to ImageKit
    const uploadResult = await imagekit.upload({
      file: base64data,
      fileName: fileName,
      folder: folder,
    });

    return NextResponse.json({
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      name: uploadResult.name,
    });
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
