const BASE_URL = '/api/books';

// ── Image upload ──────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Image upload failed');

  const data = await res.json();
  return data.url; // returns Cloudinary URL string
}

// ── Books CRUD ────────────────────────────────────────────
export async function getBooks() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function createBook(bookData: {
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: string;
  coverImage?: string;
  description?: string;
}) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create book');
  }

  return res.json(); // returns saved MongoDB document
}