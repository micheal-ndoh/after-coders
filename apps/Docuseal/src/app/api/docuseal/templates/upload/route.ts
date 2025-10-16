import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

const DOCUSEAL_API_BASE_URL = process.env.DOCUSEAL_URL || 'https://api.docuseal.com';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    const docusealFormData = new FormData();
    docusealFormData.append('file', file);

    const res = await fetch(`${DOCUSEAL_API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'X-Auth-Token': process.env.DOCUSEAL_API_KEY ?? '',
      },
      body: docusealFormData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating DocuSeal template:', message);
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
