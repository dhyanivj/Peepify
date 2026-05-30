import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { passcode } = await request.json();
    const correctPasscode = process.env.ADMIN_PASSCODE || 'peepify-admin';

    if (passcode === correctPasscode) {
      return NextResponse.json({
        success: true,
        message: 'Authenticated successfully!',
      });
    }

    // Artificial delay to mitigate high-speed brute-force attacks
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: false,
      error: 'Incorrect passcode!',
    }, { status: 401 });
  } catch (error) {
    console.error('Auth handler error:', error);
    return NextResponse.json({ error: error.message || 'An internal error occurred.' }, { status: 500 });
  }
}
