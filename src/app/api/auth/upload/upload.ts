import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File → base64 because Cloudinary SDK needs a string, not a File object
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await uploadFile(dataUri);

    return NextResponse.json({
      url: result.secure_url,       // ← "https://res.cloudinary.com/..."
      public_id: result.public_id,  // ← for deletion later
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}