import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { referenceImage, avatarImage } = await request.json();

    if (!referenceImage || !avatarImage) {
      return NextResponse.json({ error: 'Both reference and avatar images are required.' }, { status: 400 });
    }

    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) {
      return NextResponse.json({ error: 'GCP Project ID not configured.' }, { status: 500 });
    }

    // Extract base64 payload from data URL if present
    const refBase64 = referenceImage.includes(',') ? referenceImage.split(',')[1] : referenceImage;
    const avatarBase64 = avatarImage.includes(',') ? avatarImage.split(',')[1] : avatarImage;

    if (!refBase64 || !avatarBase64) {
      return NextResponse.json({ error: 'Invalid image data format.' }, { status: 400 });
    }

    const storage = new Storage({
      projectId: project,
    });
    const bucketName = `${project}-source-bucket`;
    const bucket = storage.bucket(bucketName);

    const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const uploadFile = async (base64String, destFilename) => {
      const file = bucket.file(destFilename);
      const dataBuffer = Buffer.from(base64String, 'base64');
      await file.save(dataBuffer, {
        metadata: { contentType: 'image/jpeg' },
      });
    };

    // Parallel upload of both the source reference and the generated avatar to GCS
    await Promise.all([
      uploadFile(refBase64, `gallery/${imageId}-ref.jpg`),
      uploadFile(avatarBase64, `gallery/${imageId}-avatar.jpg`)
    ]);

    console.log(`Saved gallery pair successfully on consent with ID: ${imageId}`);

    return NextResponse.json({
      success: true,
      message: 'Images successfully saved to the Peep Gallery!',
      id: imageId
    });
  } catch (error) {
    console.error('Error in /api/gallery/save:', error);
    return NextResponse.json({ error: error.message || 'Failed to save to gallery.' }, { status: 500 });
  }
}
