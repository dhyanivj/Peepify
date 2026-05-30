import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id } = await request.json();

    // Strict validation of the ID parameter to prevent directory traversal or parameter tampering
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid Image ID format.' }, { status: 400 });
    }

    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) {
      return NextResponse.json({ error: 'GCP Project ID not configured.' }, { status: 500 });
    }

    const storage = new Storage({
      projectId: project,
    });
    const bucketName = `${project}-source-bucket`;
    const bucket = storage.bucket(bucketName);

    const file = bucket.file(`gallery/${id}-avatar.jpg`);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Generated avatar file not found in GCS.' }, { status: 404 });
    }

    // Retrieve current metadata to preserve existing fields like funnyName
    const [metadata] = await file.getMetadata();
    const existingCustomMetadata = metadata.metadata || {};

    // Update GCS custom metadata consented key to 'true' to publish the image in the public Peep Gallery
    await file.setMetadata({
      metadata: {
        ...existingCustomMetadata,
        consented: 'true'
      }
    });

    console.log(`Registered user consent and published Polaroid for ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Consent registered! Caricature added to Peep Gallery.',
      id: id
    });
  } catch (error) {
    console.error('Error in /api/gallery/save consent registration:', error);
    return NextResponse.json({ error: error.message || 'Failed to save to gallery.' }, { status: 500 });
  }
}
