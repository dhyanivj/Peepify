import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'avatar'; // Default to avatar, option: 'ref'

    if (type !== 'avatar' && type !== 'ref') {
      return new NextResponse('Invalid image type request. Must be ref or avatar.', { status: 400 });
    }

    // Secure original reference photos: only authorize requests with the correct passcode query param
    if (type === 'ref') {
      const passcode = searchParams.get('passcode');
      const correctPasscode = process.env.ADMIN_PASSCODE || 'peepify-admin';
      if (passcode !== correctPasscode) {
        return new NextResponse('Unauthorized: Access to original reference images is restricted.', { status: 401 });
      }
    }

    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) {
      return new NextResponse('GCP Project ID not configured.', { status: 500 });
    }

    const storage = new Storage({
      projectId: project,
    });
    const bucketName = `${project}-source-bucket`;
    const bucket = storage.bucket(bucketName);
    
    // File structure is: 'gallery/{id}-ref.jpg' or 'gallery/{id}-avatar.jpg'
    const fileName = `gallery/${id}-${type}.jpg`;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse('Image file not found.', { status: 404 });
    }

    // Download file buffer from Google Cloud Storage
    const [buffer] = await file.download();

    // Stream the binary buffer with long-lived browser caching for extreme performance
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error streaming image from GCS:', error);
    return new NextResponse('Internal server error during image stream.', { status: 500 });
  }
}
