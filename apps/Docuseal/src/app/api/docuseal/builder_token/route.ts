import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    const token = jwt.sign(
      { user_email: process.env.DOCUSEAL_USER_EMAIL }, // The user email for the DocuSeal builder session
      process.env.DOCUSEAL_API_KEY || '',
      { expiresIn: '1h' }
    );
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
