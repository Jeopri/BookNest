'use client'
import Footer from '@/components/util/Footer';
import Header from '@/components/util/Header';
import Sidebar from '@/components/util/Sidebar';
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, Edit, Eye, Filter, Trash, X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { useMemo, useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: string;
  coverImage: string;
  description?: string;
};

type SortKey = 'id' | 'title' | 'author' | 'genre' | 'status' | 'publishDate' | 'price';

type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

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

type VisibleColumns = Record<'id' | 'title' | 'author' | 'genre' | 'status' | 'publishDate' | 'price' | 'actions', boolean>;

type EditableBook = Omit<Book, 'coverImage'> & {
  coverImage: string | null;
  coverImageFile?: File | null;
};

const apiBooksUrl = '/api/books';

function getSortableValue(book: Book, key: SortKey): string | number {
  if (key === 'price') {
    return parseFloat(book.price.replace(/^[^0-9.-]+/, '')) || 0;
  }
  return book[key].toString().toLowerCase();
}

const initialBooks: Book[] = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', status: 'Available', publishDate: '1925-04-10', price: '$12.99', coverImage: '/images/z.jpg' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', status: 'Available', publishDate: '1960-07-11', price: '$14.99', coverImage: '/images/m.png' },
  { id: 3, title: '1984', author: 'George Orwell', genre: 'Science Fiction', status: 'On Loan', publishDate: '1949-06-08', price: '$11.99', coverImage: '/images/w.JPG' },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', status: 'Available', publishDate: '1813-01-28', price: '$9.99', coverImage: '/api/placeholder/200/300' },
  { id: 5, title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', status: 'Available', publishDate: '1937-09-21', price: '$13.99', coverImage: '/api/placeholder/200/300' },
  { id: 6, title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Coming-of-age', status: 'On Loan', publishDate: '1951-07-16', price: '$10.99', coverImage: '/api/placeholder/200/300' },
  { id: 7, title: 'Brave New World', author: 'Aldous Huxley', genre: 'Science Fiction', status: 'Available', publishDate: '1932-06-01', price: '$12.49', coverImage: '/api/placeholder/200/300' },
  { id: 8, title: 'Lord of the Flies', author: 'William Golding', genre: 'Adventure', status: 'Available', publishDate: '1954-09-17', price: '$11.49', coverImage: '/api/placeholder/200/300' },
  { id: 9, title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fantasy', status: 'On Loan', publishDate: '1988-01-01', price: '$10.99', coverImage: '/api/placeholder/200/300' },
  { id: 10, title: 'Moby Dick', author: 'Herman Melville', genre: 'Adventure', status: 'Available', publishDate: '1851-10-18', price: '$12.99', coverImage: '/api/placeholder/200/300' },
  { id: 11, title: 'Wuthering Heights', author: 'Emily Brontë', genre: 'Gothic', status: 'Available', publishDate: '1847-12-19', price: '$9.99', coverImage: '/api/placeholder/200/300' },
  { id: 12, title: 'Don Quixote', author: 'Miguel de Cervantes', genre: 'Classic', status: 'On Loan', publishDate: '1605-01-16', price: '$14.99', coverImage: '/api/placeholder/200/300' },
];

export default function Dashboard() {
  const [data, setData] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<EditableBook | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
    
  const handleEditBook = (book: Book) => {
    const formattedBook: EditableBook = {
      ...book,
      price: book.price.replace('$', ''),
      coverImageFile: null,
    };

    setBookToEdit(formattedBook);
    setEditModalOpen(true);
  };

  const handleUpdateBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookToEdit) return;

    const updatedBook: Book = {
      ...bookToEdit,
      price: `$${parseFloat(bookToEdit.price).toFixed(2)}`,
      coverImage: bookToEdit.coverImage || '/api/placeholder/200/300',
    };

    await updateBook(updatedBook);
    setEditModalOpen(false);
    setBookToEdit(null);
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof EditableBook;

    setBookToEdit(prev => {
      if (!prev) return prev;
      return { ...prev, [key]: value } as EditableBook;
    });
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bookToEdit) return;

    const previewUrl = URL.createObjectURL(file);
    setBookToEdit(prev => {
      if (!prev) return prev;
      return { ...prev, coverImage: previewUrl, coverImageFile: file } as EditableBook;
    });
  };

  const handleEditImageRemove = () => {
    setBookToEdit(prev => {
      if (!prev) return prev;
      return { ...prev, coverImage: null, coverImageFile: null } as EditableBook;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateBook = async (book: Book) => {
    try {
      const response = await fetch(`${apiBooksUrl}/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        console.error('Failed to update book:', response.statusText);
      }

      setData(prev => prev.map(item => (item.id === book.id ? book : item)));
    } catch (error) {
      console.error('Update book failed:', error);
      setData(prev => prev.map(item => (item.id === book.id ? book : item)));
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetch(apiBooksUrl);
        if (response.ok) {
          const books: Book[] = await response.json();
          setData(books);
        } else {
          setData(initialBooks);
        }
      } catch (error) {
        console.error('Fetch books failed:', error);
        setData(initialBooks);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBook, setNewBook] = useState<NewBookForm>({
    title: '',
    author: '',
    genre: '',
    status: '',
    publishDate: '',
    price: '',
    description: '',
    coverImage: null,
    coverImagePreview: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value,
    } as NewBookForm));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setNewBook(prev => ({
      ...prev,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/auth/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        setNewBook(prev => ({
          ...prev,
          coverImagePreview: data.url,
        }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleImageRemove = () => {
    setNewBook(prev => ({
      ...prev,
      coverImage: null,
      coverImagePreview: null,
    }));
  };

  const handleAddBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newId = data.length > 0 ? Math.max(...data.map(book => book.id)) + 1 : 1;
    const formattedPrice = `$${parseFloat(newBook.price || '0').toFixed(2)}`;

    const bookToAdd: Book = {
      id: newId,
      title: newBook.title,
      author: newBook.author,
      genre: newBook.genre,
      status: newBook.status,
      publishDate: newBook.publishDate,
      price: formattedPrice,
      description: newBook.description,
      coverImage: newBook.coverImagePreview || '/api/placeholder/200/300',
    };

    setData(prevData => [bookToAdd, ...prevData]);
    setNewBook({
      title: '',
      author: '',
      genre: '',
      status: '',
      publishDate: '',
      price: '',
      description: '',
      coverImage: null,
      coverImagePreview: null,
    });
    setAddModalOpen(false);
  };

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    id: true,
    title: true,
    author: true,
    genre: true,
    status: true,
    publishDate: true,
    price: true,
    actions: true,
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
    
    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Sorting function
    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter function
    const filteredData = useMemo(() => {
        const searchTerm = filterValue.toLowerCase();
        return data.filter(item => {
            return (
                item.title.toLowerCase().includes(searchTerm) ||
                item.author.toLowerCase().includes(searchTerm) ||
                item.genre.toLowerCase().includes(searchTerm) ||
                item.status.toLowerCase().includes(searchTerm)
            );
        });
    }, [data, filterValue]);

    // Sort function
    const sortedData = useMemo(() => {
        const sortableData = [...filteredData];
        sortableData.sort((a, b) => {
            const aValue = getSortableValue(a, sortConfig.key);
            const bValue = getSortableValue(b, sortConfig.key);

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableData;
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    // Row selection handlers
    const toggleRowSelection = (id: number) => {
        setSelectedRows(prev => {
            if (prev.includes(id)) {
                return prev.filter(rowId => rowId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleAllRows = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(row => row.id));
        }
    };

    // Column visibility handler
    const toggleColumnVisibility = (column: keyof VisibleColumns) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    // Open view modal
    const handleViewBook = (book: Book) => {
        setSelectedBook(book);
        setViewModalOpen(true);
    };

    // Close view modal
    const handleCloseModal = () => {
        setViewModalOpen(false);
        setSelectedBook(null);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Book Inventory</h1>
                        <p className="text-gray-600">Manage your book collection</p>
                    </div>
                   
                    {editModalOpen && bookToEdit && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Edit Book</h3>
                <button 
                    onClick={() => setEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
            </div>
            
            {/* Modal Content - Form */}
            <form onSubmit={handleUpdateBook} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div>
                        <div className="mb-4">
                            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                id="edit-title"
                                name="title"
                                value={bookToEdit.title}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="edit-author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <input
                                type="text"
                                id="edit-author"
                                name="author"
                                value={bookToEdit.author}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="edit-genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <select
                                id="edit-genre"
                                name="genre"
                                value={bookToEdit.genre}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a genre</option>
                                <option value="Fiction">Fiction</option>
                                <option value="Non-Fiction">Non-Fiction</option>
                                <option value="Science Fiction">Science Fiction</option>
                                <option value="Fantasy">Fantasy</option>
                                <option value="Mystery">Mystery</option>
                                <option value="Romance">Romance</option>
                                <option value="Horror">Horror</option>
                                <option value="Biography">Biography</option>
                                <option value="History">History</option>
                                <option value="Classic">Classic</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Coming-of-age">Coming-of-age</option>
                                <option value="Gothic">Gothic</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="edit-publishDate" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                            <input
                                type="date"
                                id="edit-publishDate"
                                name="publishDate"
                                value={bookToEdit.publishDate}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2">$</span>
                                <input
                                    type="number"
                                    id="edit-price"
                                    name="price"
                                    value={bookToEdit.price}
                                    onChange={handleEditInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Status, Description, Cover Image */}
                    <div>
                        <div className="mb-4">
                            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                id="edit-status"
                                name="status"
                                value={bookToEdit.status}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select status</option>
                                <option value="Available">Available</option>
                                <option value="On Loan">On Loan</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="edit-description"
                                name="description"
                                value={bookToEdit.description || ''}
                                onChange={handleEditInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                                {bookToEdit.coverImage ? (
                                    <div className="relative w-40 h-56">
                                        <Image
                                            src={bookToEdit.coverImage}
                                            alt="Book cover"
                                            width={160}
                                            height={224}
                                            className="object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleEditImageRemove}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="flex justify-center">
                                            <label htmlFor="edit-coverImage" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                                Choose Image
                                                <input
                                                    type="file"
                                                    id="edit-coverImage"
                                                    name="coverImage"
                                                    onChange={handleEditImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Or drag and drop an image here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Update Book
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
                    {addModalOpen && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Add New Book</h3>
                <button 
                    onClick={() => setAddModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Modal Content - Form */}
            <form onSubmit={handleAddBook} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info + Image Upload */}
                    <div>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newBook.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={newBook.author}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <select
                                id="genre"
                                name="genre"
                                value={newBook.genre}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a genre</option>
                                <option value="Fiction">Fiction</option>
                                <option value="Non-Fiction">Non-Fiction</option>
                                <option value="Science Fiction">Science Fiction</option>
                                <option value="Fantasy">Fantasy</option>
                                <option value="Mystery">Mystery</option>
                                <option value="Romance">Romance</option>
                                <option value="Horror">Horror</option>
                                <option value="Biography">Biography</option>
                                <option value="History">History</option>
                                <option value="Classic">Classic</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Coming-of-age">Coming-of-age</option>
                                <option value="Gothic">Gothic</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                            <input
                                type="date"
                                id="publishDate"
                                name="publishDate"
                                value={newBook.publishDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2">$</span>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={newBook.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Status, Description, Cover Image */}
                    <div>
                        <div className="mb-4">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={newBook.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select status</option>
                                <option value="Available">Available</option>
                                <option value="On Loan">On Loan</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newBook.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                                {newBook.coverImagePreview ? (
                                    <div className="relative w-40 h-56">
                                       <CldImage
                                            src={newBook.coverImagePreview} // Use this sample image or upload your own via the Media Explorer
                                            width="500" // Transform the image: auto-crop to square aspect_ratio
                                            height="500"
                                            crop={{
                                                type: 'auto',
                                                source: true
                                            }}
                                            alt="Nigga"
                                            />
                                        <button
                                            type="button"
                                            onClick={handleImageRemove}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="flex justify-center">
                                            <label htmlFor="coverImage" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                                Choose Image
                                                <input
                                                    type="file"
                                                    id="coverImage"
                                                    name="coverImage"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Or drag and drop an image here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => setAddModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Book
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
                    {/* Card List Section */}
                    <div className="bg-white rounded-lg shadow text-black p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                            <h3 className="font-bold text-lg text-gray-700">Book Management</h3>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Sort dropdown */}
                                <div className="relative text-black">
                                    <select 
                                        className="pl-2 pr-8 py-2 border rounded-md appearance-none"
                                        value={`${sortConfig.key}-${sortConfig.direction}`}
                                        onChange={(e) => {
                                            const [key, direction] = e.target.value.split('-');
                                            setSortConfig({ key: key as SortKey, direction: direction as 'asc' | 'desc' });
                                        }}
                                    >
                                        <option value="id-asc">ID (Ascending)</option>
                                        <option value="id-desc">ID (Descending)</option>
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
                                
                                {/* Filter input */}
                                <div className="relative text-black">
                                    <input
                                        type="text"
                                        placeholder="Search books..."
                                        className="pl-8 pr-4 py-2 border rounded-md w-full sm:w-auto"
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                    />
                                    <Filter size={16} className="absolute left-2 top-3 text-gray-400" />
                                </div>
                                
                                {/* Column visibility dropdown */}
                                <div className="relative">
                                    <button 
                                        className="px-3 py-2 border rounded-md flex items-center"
                                        onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                                    >
                                        <Eye size={16} className="mr-1" />
                                        <span>Fields</span>
                                    </button>
                                    
                                    {columnMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                                            {(Object.keys(visibleColumns) as Array<keyof VisibleColumns>).map(column => (
                                                <div 
                                                    key={column} 
                                                    className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => toggleColumnVisibility(column)}
                                                >
                                                    <span className="capitalize">{column}</span>
                                                    {visibleColumns[column] && <Check size={16} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Select all checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={toggleAllRows}
                                    />
                                    <span className="text-sm text-gray-500">Select All</span>
                                </div>
                            </div>
                            <button 
    onClick={() => setAddModalOpen(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
>
    <span className="mr-1">+</span> Add Book
</button>
                        </div>
                     
                        {/* Card Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {paginatedData.map((book) => (
                                <div 
                                    key={book.id} 
                                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            book.status === 'Available' 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${book.status === 'Available' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                                            {book.status}
                                        </span>
                                    </div>

                                    {/* Selection checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(book.id)}
                                        onChange={() => toggleRowSelection(book.id)}
                                        className="absolute top-3 left-3 z-10 w-5 h-5"
                                    />

                                    {/* Book Cover Image */}
                                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                        {book.coverImage ? (
                                            <Image
                                                src={book.coverImage}
                                                alt={book.title}
                                                width={160}
                                                height={224}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <span className="text-sm">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4 relative z-5">
                                        {/* Title */}
                                        {visibleColumns.title && (
                                            <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{book.title}</h4>
                                        )}
                                        
                                        {/* Author */}
                                        {visibleColumns.author && (
                                            <p className="text-xs text-gray-500 mb-3 font-medium">by <span className="text-gray-700">{book.author}</span></p>
                                        )}
                                        
                                        {/* Info Grid */}
                                        <div className="space-y-2 text-xs mb-4 bg-gray-50 -mx-4 px-4 py-3 rounded-lg">
                                            {visibleColumns.genre && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium">Genre</span>
                                                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{book.genre}</span>
                                                </div>
                                            )}
                                            
                                            {visibleColumns.publishDate && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium">Published</span>
                                                    <span className="text-gray-700 font-semibold">{book.publishDate}</span>
                                                </div>
                                            )}
                                            
                                            {visibleColumns.price && (
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                    <span className="text-gray-500 font-medium">Price</span>
                                                    <span className="text-lg font-bold text-blue-600">{book.price}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        {visibleColumns.actions && (
                                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                                                <button 
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    onClick={() => handleViewBook(book)}
                                                >
                                                    <Eye size={14} />
                                                    <span className="hidden sm:inline">View</span>
                                                </button>
                                                <button 
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" 
                                                    onClick={() => handleEditBook(book)}
                                                >
                                                    <Edit size={14} />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                    <Trash size={14} />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty state */}
                        {paginatedData.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-2">No books found matching your criteria</p>
                                <p className="text-gray-400">Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="py-4 mt-6 flex items-center justify-between border-t">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                                        <span className="font-medium">
                                            {Math.min(currentPage * rowsPerPage, sortedData.length)}
                                        </span>{" "}
                                        of <span className="font-medium">{sortedData.length}</span> books
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border ${
                                                    currentPage === page
                                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                } text-sm font-medium`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>

            {/* View Book Modal */}
            {viewModalOpen && selectedBook && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold text-gray-900">Book Details</h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Modal Content - Two Column Layout */}
                        <div className="flex flex-col md:flex-row p-6">
                            {/* Left Column - Image (Fixed 500x500px) */}
                            <div className="md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                                    <div className="relative h-96 w-96 md:h-[500px] md:w-[500px]">
                                        <Image 
                                            src={selectedBook.coverImage} 
                                            alt={selectedBook.title}
                                            layout="fill"
                                            objectFit="contain"
                                            className="max-h-full max-w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column - Book Information */}
                            <div className="md:w-1/2 md:pl-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h2>
                                <p className="text-lg text-gray-600 mb-6">by {selectedBook.author}</p>
                                
                                <div className="grid grid-cols-1 gap-4 text-gray-700">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">ID:</span>
                                        <span>{selectedBook.id}</span>
                                    </div>
                                    
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Genre:</span>
                                        <span>{selectedBook.genre}</span>
                                    </div>
                                    
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Publication Date:</span>
                                        <span>{selectedBook.publishDate}</span>
                                    </div>
                                    
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Price:</span>
                                        <span className="font-semibold">{selectedBook.price}</span>
                                    </div>
                                    
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Status:</span>
                                        <span className={`font-semibold ${
                                            selectedBook.status === 'Available' ? 'text-green-600' : 'text-amber-600'
                                        }`}>
                                            {selectedBook.status}
                                        </span>
                                    </div>
                                    
                                    {/* Additional information could be added here */}
                                    <div className="mt-4">
                                        <p className="font-medium mb-2">Description:</p>
                                        <p className="text-gray-600">
                                            {selectedBook.description || 'No description available for this book.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="flex justify-end p-4 border-t">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}