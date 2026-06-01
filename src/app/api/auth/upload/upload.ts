import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '@/lib/cloudinary';
import formidable from 'formidable';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing the file' });

    const file = files.file?.[0];

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'nextjs_uploads',
    });

    res.status(200).json({ url: result.secure_url });
  });
}
