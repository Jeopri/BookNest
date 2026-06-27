'use client';
import { Eye, Edit, Trash } from 'lucide-react';
import Image from 'next/image';

export type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: string;
  coverImage: string;
  description?: string;
};

type VisibleColumns = Record<'id' | 'title' | 'author' | 'genre' | 'status' | 'publishDate' | 'price' | 'actions', boolean>;

export default function BookCard({
  book,
  visibleColumns,
  selected,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
}: {
  book: Book;
  visibleColumns: VisibleColumns;
  selected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          book.status === 'Available'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${book.status === 'Available' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
          {book.status}
        </span>
      </div>

      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        className="absolute top-3 left-3 z-10 w-5 h-5"
      />

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
        {visibleColumns.title && (
          <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{book.title}</h4>
        )}

        {visibleColumns.author && (
          <p className="text-xs text-gray-500 mb-3 font-medium">by <span className="text-gray-700">{book.author}</span></p>
        )}

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

        {visibleColumns.actions && (
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">View</span>
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Edit size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <Trash size={14} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
