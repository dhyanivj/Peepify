import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Authenticate using Authorization Bearer token matching ADMIN_PASSCODE
    const authHeader = request.headers.get('authorization');
    const passcode = authHeader?.split(' ')[1];
    const correctPasscode = process.env.ADMIN_PASSCODE || 'peepify-admin';

    if (passcode !== correctPasscode) {
      // Artificial delay to mitigate high-speed brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({ error: 'Unauthorized: Incorrect passcode.' }, { status: 401 });
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

    // Fetch all files from GCS gallery/ prefix
    const [files] = await bucket.getFiles({
      prefix: 'gallery/',
    });

    const avatarFiles = files.filter(file => file.name.endsWith('-avatar.jpg'));

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    const totalCount = avatarFiles.length;

    // Parse files and calculate stats
    const parsedImages = avatarFiles.map(file => {
      const createdDate = new Date(file.metadata.updated || file.metadata.timeCreated);
      const diffMs = now - createdDate;

      if (diffMs <= oneDayMs) todayCount++;
      if (diffMs <= sevenDaysMs) weekCount++;
      if (diffMs <= thirtyDaysMs) monthCount++;

      return {
        id: file.name.split('/').pop().replace('-avatar.jpg', ''),
        created: createdDate,
      };
    });

    // Compute 7-day trend (from 6 days ago up to today)
    const dailyTrend = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      // Count matches inside this calendar day
      const count = parsedImages.filter(img => {
        return img.created >= d && img.created < nextD;
      }).length;

      dailyTrend.push({
        label: weekdays[d.getDay()],
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: count,
      });
    }

    // Sort complete moderation image list newest first
    parsedImages.sort((a, b) => b.created - a.created);
    
    // Map back for compact transmission
    const images = parsedImages.map(img => ({
      id: img.id,
      created: img.created.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalCount,
      },
      dailyTrend,
      images,
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve stats.' }, { status: 500 });
  }
}
