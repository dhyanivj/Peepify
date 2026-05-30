import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) {
      return NextResponse.json({ error: 'GCP Project ID not configured.' }, { status: 500 });
    }

    const storage = new Storage({
      projectId: project,
    });
    const bucketName = `${project}-source-bucket`;
    const bucket = storage.bucket(bucketName);

    // List all files with the prefix 'gallery/' in the bucket
    const [files] = await bucket.getFiles({
      prefix: 'gallery/',
    });

    // We only care about the avatar files to list in the gallery
    // Format: 'gallery/{id}-avatar.jpg'
    const avatars = files
      .filter(file => file.name.endsWith('-avatar.jpg'))
      .map(file => {
        const id = file.name.split('/').pop().replace('-avatar.jpg', '');
        return {
          id: id,
          updated: file.metadata.updated || file.metadata.timeCreated,
        };
      });

    // Sort chronologically (newest first)
    avatars.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    // Limit to max 22 items as requested (showing 20-22 latest images)
    const latestAvatars = avatars.slice(0, 22);

    return NextResponse.json({
      success: true,
      avatars: latestAvatars,
    });
  } catch (error) {
    console.error('Error listing gallery files:', error);
    return NextResponse.json({ error: error.message || 'Failed to list gallery items.' }, { status: 500 });
  }
}
