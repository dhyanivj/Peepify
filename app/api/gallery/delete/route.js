import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, passcode } = await request.json();
    const correctPasscode = process.env.ADMIN_PASSCODE || 'peepify-admin';

    // Verify passcode for secure deletion authorization
    if (passcode !== correctPasscode) {
      return NextResponse.json({ error: 'Unauthorized: Incorrect passcode.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required for deletion.' }, { status: 400 });
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

    const refFile = bucket.file(`gallery/${id}-ref.jpg`);
    const avatarFile = bucket.file(`gallery/${id}-avatar.jpg`);

    // Helper to delete a file silently if it exists
    const deleteFileIfExists = async (fileObject) => {
      const [exists] = await fileObject.exists();
      if (exists) {
        await fileObject.delete();
      }
    };

    // Parallel deletion of both files from GCS
    await Promise.all([
      deleteFileIfExists(refFile),
      deleteFileIfExists(avatarFile)
    ]);

    console.log(`Successfully deleted gallery pair with ID: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: `Image pair with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting GCS files:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete images.' }, { status: 500 });
  }
}
