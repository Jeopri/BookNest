'use client'
import BookCard, { type Book } from '@/components/BookCard';
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, Eye, Filter, X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { useMemo, useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

type SortKey = 'title' | 'author' | 'genre' | 'status' | 'publishDate' | 'price';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' };

type NewBookForm = {
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: string;
  description: string;
  coverImage: File | null;
  coverImagePreview: string | null;
};

type EditableBook = Omit<Book, 'coverImage'> & { coverImage: string | null; coverImageFile?: File | null };

type VisibleColumns = Record<'id' | 'title' | 'author' | 'genre' | 'status' | 'publishDate' | 'price' | 'actions', boolean>;

function getSortableValue(book: Book, key: SortKey): string | number {
  if (key === 'price') return book.price;
  return book[key].toString().toLowerCase();
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/auth/upload', { method: 'POST', body: formData });
  const data = await res.json();
  return data.url;
}

export default function ListingPage() {
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<EditableBook | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditBook = (book: Book) => {
    setBookToEdit({ ...book, coverImageFile: null });
    setEditModalOpen(true);
  };

  const handleUpdateBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookToEdit) return;

    let coverImage = bookToEdit.coverImage;
    if (bookToEdit.coverImageFile) {
      coverImage = await uploadImage(bookToEdit.coverImageFile);
    }

    const updatedBook: Partial<Book> = {
      title: bookToEdit.title,
      author: bookToEdit.author,
      genre: bookToEdit.genre,
      publishDate: bookToEdit.publishDate,
      price: Number(bookToEdit.price) || 0,
      status: bookToEdit.status,
      description: bookToEdit.description || '',
      coverImage: coverImage || '/api/placeholder/200/300',
    };

    try {
      const res = await fetch(`/api/books/${bookToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook),
      });
      if (!res.ok) throw new Error('Update failed');
      const saved = await res.json();
      setData(prev => prev.map(item => (item._id === bookToEdit._id ? saved : item)));
    } catch (err) {
      console.error('Update book failed:', err);
    }

    setEditModalOpen(false);
    setBookToEdit(null);
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookToEdit(prev => prev ? { ...prev, [name]: value } as EditableBook : prev);
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bookToEdit) return;
    setBookToEdit(prev => prev ? { ...prev, coverImage: URL.createObjectURL(file), coverImageFile: file } as EditableBook : prev);
  };

  const handleEditImageRemove = () => {
    setBookToEdit(prev => prev ? { ...prev, coverImage: null, coverImageFile: null } as EditableBook : prev);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      const res = await fetch(`/api/books/${book._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setData(prev => prev.filter(item => item._id !== book._id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/books');
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error('Fetch books failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBook, setNewBook] = useState<NewBookForm>({
    title: '', author: '', genre: '', status: '', publishDate: '', price: '', description: '',
    coverImage: null, coverImagePreview: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewBook(prev => ({ ...prev, coverImage: file, coverImagePreview: URL.createObjectURL(file) }));
  };

  const handleImageRemove = () => setNewBook(prev => ({ ...prev, coverImage: null, coverImagePreview: null }));

  const handleAddBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let coverImageUrl = '/api/placeholder/200/300';
    if (newBook.coverImage) {
      coverImageUrl = await uploadImage(newBook.coverImage);
    }

    const payload = {
      title: newBook.title,
      author: newBook.author,
      genre: newBook.genre,
      status: newBook.status,
      publishDate: newBook.publishDate,
      description: newBook.description,
      coverImage: coverImageUrl,
      price: parseFloat(newBook.price || '0'),
    };

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Create failed');
      const saved = await res.json();
      setData(prev => [saved, ...prev]);
    } catch (err) {
      console.error('Add book failed:', err);
    }

    setNewBook({ title: '', author: '', genre: '', status: '', publishDate: '', price: '', description: '', coverImage: null, coverImagePreview: null });
    setAddModalOpen(false);
  };

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    id: true, title: true, author: true, genre: true, status: true, publishDate: true, price: true, actions: true,
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filteredData = useMemo(() => {
    const searchTerm = filterValue.toLowerCase();
    return data.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.author.toLowerCase().includes(searchTerm) ||
      item.genre.toLowerCase().includes(searchTerm) ||
      item.status.toLowerCase().includes(searchTerm)
    );
  }, [data, filterValue]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = getSortableValue(a, sortConfig.key);
      const bVal = getSortableValue(b, sortConfig.key);
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAllRows = () => {
    setSelectedRows(prev => prev.length === paginatedData.length ? [] : paginatedData.map(r => r._id));
  };
  const toggleColumnVisibility = (column: keyof VisibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };
  const handleViewBook = (book: Book) => {
    setSelectedBook(book);
    setViewModalOpen(true);
  };
  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Book Inventory</h1>
        <p className="text-gray-600">Manage your book collection</p>
      </div>

      {editModalOpen && bookToEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Edit Book</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateBook} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="edit-title" name="title" value={bookToEdit.title} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input type="text" id="edit-author" name="author" value={bookToEdit.author} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <select id="edit-genre" name="genre" value={bookToEdit.genre} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select a genre</option>
                      {['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Horror', 'Biography', 'History', 'Classic', 'Adventure', 'Coming-of-age', 'Gothic'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-publishDate" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input type="date" id="edit-publishDate" name="publishDate" value={bookToEdit.publishDate.split('T')[0]} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <input type="number" id="edit-price" name="price" value={bookToEdit.price} onChange={handleEditInputChange} step="0.01" min="0" className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="edit-status" name="status" value={bookToEdit.status} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select status</option>
                      <option value="Available">Available</option>
                      <option value="On Loan">On Loan</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="edit-description" name="description" value={bookToEdit.description || ''} onChange={handleEditInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                      {bookToEdit.coverImage ? (
                        <div className="relative w-40 h-56">
                          <Image src={bookToEdit.coverImage} alt={bookToEdit.title} width={160} height={224} className="object-contain" />
                          <button type="button" onClick={handleEditImageRemove} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <label htmlFor="edit-coverImage" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                            Choose Image
                            <input type="file" id="edit-coverImage" onChange={handleEditImageChange} accept="image/*" className="hidden" ref={fileInputRef} />
                          </label>
                          <p className="text-sm text-gray-500 mt-2">Or drag and drop an image here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Update Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add New Book</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddBook} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="title" name="title" value={newBook.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input type="text" id="author" name="author" value={newBook.author} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <select id="genre" name="genre" value={newBook.genre} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select a genre</option>
                      {['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Horror', 'Biography', 'History', 'Classic', 'Adventure', 'Coming-of-age', 'Gothic'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input type="date" id="publishDate" name="publishDate" value={newBook.publishDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <input type="number" id="price" name="price" value={newBook.price} onChange={handleInputChange} step="0.01" min="0" className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="status" name="status" value={newBook.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select status</option>
                      <option value="Available">Available</option>
                      <option value="On Loan">On Loan</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="description" name="description" value={newBook.description} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                      {newBook.coverImagePreview ? (
                        <div className="relative w-40 h-56">
                          <CldImage src={newBook.coverImagePreview} width="500" height="500" crop={{ type: 'auto', source: true }} alt={newBook.title || 'Book cover preview'} />
                          <button type="button" onClick={handleImageRemove} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <label htmlFor="coverImage" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                            Choose Image
                            <input type="file" id="coverImage" onChange={handleImageChange} accept="image/*" className="hidden" />
                          </label>
                          <p className="text-sm text-gray-500 mt-2">Or drag and drop an image here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow text-black p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h3 className="font-bold text-lg text-gray-700">Book Management</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative text-black">
              <select className="pl-2 pr-8 py-2 border rounded-md appearance-none" value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={e => { const [k, d] = e.target.value.split('-'); setSortConfig({ key: k as SortKey, direction: d as 'asc' | 'desc' }); }}>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author-asc">Author (A-Z)</option>
                <option value="author-desc">Author (Z-A)</option>
                <option value="genre-asc">Genre (A-Z)</option>
                <option value="genre-desc">Genre (Z-A)</option>
                <option value="publishDate-asc">Publish Date (Oldest)</option>
                <option value="publishDate-desc">Publish Date (Newest)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
              <ArrowUpDown size={16} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative text-black">
              <input type="text" placeholder="Search books..." className="pl-8 pr-4 py-2 border rounded-md w-full sm:w-auto" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
              <Filter size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>
            <div className="relative">
              <button className="px-3 py-2 border rounded-md flex items-center" onClick={() => setColumnMenuOpen(!columnMenuOpen)}>
                <Eye size={16} className="mr-1" /><span>Fields</span>
              </button>
              {columnMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                  {(Object.keys(visibleColumns) as Array<keyof VisibleColumns>).map(col => (
                    <div key={col} className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer" onClick={() => toggleColumnVisibility(col)}>
                      <span className="capitalize">{col}</span>
                      {visibleColumns[col] && <Check size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} onChange={toggleAllRows} />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
          <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <span className="mr-1">+</span> Add Book
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-14" />
                </div>
              </div>
            </div>
          )) : paginatedData.map(book => (
            <BookCard
              key={book._id}
              book={book}
              visibleColumns={visibleColumns}
              selected={selectedRows.includes(book._id)}
              onToggleSelect={() => toggleRowSelection(book._id)}
              onView={() => handleViewBook(book)}
              onEdit={() => handleEditBook(book)}
              onDelete={() => handleDeleteBook(book)}
            />
          ))}
        </div>

        {!loading && paginatedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No books found</p>
            <p className="text-gray-400">Try adjusting your search or add a new book</p>
          </div>
        )}

        <div className="py-4 mt-6 flex items-center justify-between border-t">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedData.length)}</span>{" "}
                of <span className="font-medium">{sortedData.length}</span> books
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {viewModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Book Details</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="flex flex-col md:flex-row p-6">
              <div className="md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                  <div className="relative h-96 w-96 md:h-[500px] md:w-[500px]">
                    <Image src={selectedBook.coverImage} alt={selectedBook.title} layout="fill" objectFit="contain" className="max-h-full max-w-full" />
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h2>
                <p className="text-lg text-gray-600 mb-6">by {selectedBook.author}</p>
                <div className="grid grid-cols-1 gap-4 text-gray-700">
                  <div className="flex justify-between border-b pb-2"><span className="font-medium">Genre:</span><span>{selectedBook.genre}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-medium">Publication Date:</span><span>{formatDate(selectedBook.publishDate)}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-medium">Price:</span><span className="font-semibold">${Number(selectedBook.price).toFixed(2)}</span></div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Status:</span>
                    <span className={`font-semibold ${selectedBook.status === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>{selectedBook.status}</span>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Description:</p>
                    <p className="text-gray-600">{selectedBook.description || 'No description available for this book.'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
