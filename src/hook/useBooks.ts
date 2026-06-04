import { useState, useEffect } from 'react';
import { getBooks, createBook, uploadImage } from '@/services/bookService';
import type { IBook } from '@/models/Book';

type NewBookForm = {
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: string;
  description: string;
  imageFile: File | null;       // raw file from input
  imagePreview: string | null;  // shown in the form preview
};

export const defaultForm: NewBookForm = {
  title: '',
  author: '',
  genre: '',
  status: '',
  publishDate: '',
  price: '',
  description: '',
  imageFile: null,
  imagePreview: null,
};

export function useBooks() {
  const [books, setBooks] = useState<IBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NewBookForm>(defaultForm);

  // Load books on mount
  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Handle text/select inputs
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle image pick → show preview immediately
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm(prev => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file), // instant local preview
    }));
  };

  const handleImageRemove = () => {
    setForm(prev => ({ ...prev, imageFile: null, imagePreview: null }));
  };

  // Handle form submit
  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload image to Cloudinary first (if one was picked)
      let coverImageUrl: string | undefined;

      if (form.imageFile) {
        coverImageUrl = await uploadImage(form.imageFile);
        // coverImageUrl is now "https://res.cloudinary.com/..."
      }

      // 2. POST book data (with Cloudinary URL) to MongoDB
      const saved = await createBook({
        title:       form.title,
        author:      form.author,
        genre:       form.genre,
        status:      form.status,
        publishDate: form.publishDate,
        price:       form.price,
        description: form.description,
        coverImage:  coverImageUrl,  // just a URL string
      });

      // 3. Update UI
      setBooks(prev => [saved, ...prev]);
      setForm(defaultForm); // reset form

    } catch (err) {
      console.error('Add book failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    books,
    isLoading,
    isSubmitting,
    form,
    handleFormChange,
    handleImageChange,
    handleImageRemove,
    handleAddBook,
  };
}