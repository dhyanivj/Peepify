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

    const funnyAdjectives = [
      'Snazzy', 'Dapper', 'Funky', 'Wobbly', 'Sassy', 'Snarky', 'Giggling', 'Sleepy', 
      'Spunky', 'Cheeky', 'Jolly', 'Zesty', 'Loopy', 'Fluffy', 'Brainy', 'Crafty', 
      'Dizzy', 'Goofy', 'Feisty', 'Chilled', 'Bouncy', 'Cranky', 'Quirky', 'Sparky'
    ];

    const funnyNouns = [
      'Peep', 'Noodle', 'Pickle', 'Capybara', 'Koala', 'Avocado', 'Panda', 'Sloth', 
      'Wizard', 'Muffin', 'Waffle', 'Taco', 'Penguin', 'Badger', 'Dino', 'Chimp', 
      'Otter', 'Pug', 'Hedgehog', 'Cactus', 'Cupcake', 'Donut', 'Yeti', 'Gnome'
    ];

    const getDeterministicFunnyName = (id) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);
      const adj = funnyAdjectives[hash % funnyAdjectives.length];
      const noun = funnyNouns[Math.floor(hash / funnyAdjectives.length) % funnyNouns.length];
      return `${adj} ${noun}`;
    };

    // We only care about the avatar files that have consented: 'true' (or no tag, which matches legacy files)
    const avatars = files
      .filter(file => {
        if (!file.name.endsWith('-avatar.jpg')) return false;
        const consented = file.metadata?.metadata?.consented;
        return consented === 'true' || consented === undefined;
      })
      .map(file => {
        const id = file.name.split('/').pop().replace('-avatar.jpg', '');
        const funnyName = file.metadata?.metadata?.funnyName || getDeterministicFunnyName(id);
        return {
          id: id,
          updated: file.metadata.updated || file.metadata.timeCreated,
          funnyName: funnyName,
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
