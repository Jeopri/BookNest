'use client'
import Image from 'next/image';
import { BookOpen, BookX, Calendar, User, Search, X, BookMarked, CheckCircle } from 'lucide-react';
import { useMemo, useState, useEffect, type FormEvent } from 'react';

type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  status: string;
  publishDate: string;
  price: number;
  coverImage: string;
  description?: string;
};

type BorrowRecord = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImage: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue';
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Available: { bg: 'bg-green-100', text: 'text-green-700', icon: 'Available' },
  'On Loan': { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'On Loan' },
  Reserved: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Reserved' },
  'Out of Stock': { bg: 'bg-red-100', text: 'text-red-700', icon: 'Out of Stock' },
};

const STATUS_ORDER = ['Available', 'On Loan', 'Reserved', 'Out of Stock'];

export default function BorrowPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowModal, setBorrowModal] = useState<Book | null>(null);
  const [formData, setFormData] = useState({ borrowerName: '', borrowerEmail: '', dueDate: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timelinePage, setTimelinePage] = useState(1);
  const timelineRowsPerPage = 10;

  useEffect(() => {
    (async () => {
      try {
        const [booksRes, borrowRes] = await Promise.all([
          fetch('/api/books'),
          fetch('/api/borrow'),
        ]);
        if (booksRes.ok) setBooks(await booksRes.json());
        if (borrowRes.ok) setBorrows(await borrowRes.json());
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredBooks = useMemo(
    () => books.filter(b =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [books, searchTerm]
  );

  const groupedBooks = useMemo(() => {
    const groups: Record<string, Book[]> = {};
    for (const status of STATUS_ORDER) {
      groups[status] = filteredBooks.filter(b => b.status === status);
    }
    return groups;
  }, [filteredBooks]);

  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: Date;
      type: 'borrowed' | 'returned' | 'overdue';
      record: BorrowRecord;
    }> = [];

    for (const record of borrows) {
      events.push({
        id: `${record._id}-borrowed`,
        date: new Date(record.borrowDate),
        type: 'borrowed',
        record,
      });
      if (record.returnDate) {
        events.push({
          id: `${record._id}-returned`,
          date: new Date(record.returnDate),
          type: 'returned',
          record,
        });
      }
      if (record.status === 'Overdue' && !record.returnDate) {
        events.push({
          id: `${record._id}-overdue`,
          date: new Date(record.dueDate),
          type: 'overdue',
          record,
        });
      }
    }

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [borrows]);

  const openBorrowModal = (book: Book) => {
    setBorrowModal(book);
    setFormData({ borrowerName: '', borrowerEmail: '', dueDate: '' });
    setError('');
  };

  const handleBorrow = async (e: FormEvent) => {
    e.preventDefault();
    if (!borrowModal) return;
    setError('');

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: borrowModal._id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Borrow failed');
      }

      const newRecord = await res.json();
      setBorrows(prev => [newRecord, ...prev]);
      const booksRes = await fetch('/api/books');
      if (booksRes.ok) setBooks(await booksRes.json());
      setSuccessMsg(
        newRecord.emailSent
          ? `"${borrowModal.title}" borrowed — confirmation sent to ${formData.borrowerEmail}`
          : `"${borrowModal.title}" borrowed successfully`
      );
      setTimeout(() => { setSuccessMsg(''); setBorrowModal(null); }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Borrow failed');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Borrow Books</h1>
        <p className="text-gray-600">Browse and manage books by status</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-4">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search books by title or author..." className="w-full border-none outline-none text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="fixed top-6 right-6 z-[60] bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm animate-pulse">
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {borrowModal && borrowModal.status === 'Available' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Borrow Book</h3>
              <button onClick={() => setBorrowModal(null)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleBorrow} className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {borrowModal.coverImage && (
                  <Image src={borrowModal.coverImage} alt={borrowModal.title} width={48} height={64} className="object-cover rounded" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{borrowModal.title}</p>
                  <p className="text-sm text-gray-500">by {borrowModal.author}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name</label>
                <input type="text" required value={formData.borrowerName} onChange={e => setFormData(p => ({ ...p, borrowerName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Email</label>
                <input type="email" required value={formData.borrowerEmail} onChange={e => setFormData(p => ({ ...p, borrowerEmail: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" required value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setBorrowModal(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm Borrow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {STATUS_ORDER.map(status => {
        const sectionBooks = groupedBooks[status];
        const style = STATUS_STYLES[status];
        if (!loading && sectionBooks.length === 0) return null;

        return (
          <div key={status} className="bg-white rounded-lg shadow text-black p-6 mb-6">
            <h3 className="font-bold text-lg text-gray-700 mb-6 flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
                <BookMarked size={14} className="mr-1.5" />
                {status}
              </span>
              <span className="text-sm font-normal text-gray-400">({loading ? '-' : sectionBooks.length})</span>
            </h3>

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
              )) : sectionBooks.map(book => (
                <div key={book._id} onClick={status === 'Available' ? () => openBorrowModal(book) : undefined} className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 ${status === 'Available' ? 'cursor-pointer' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
                    {book.coverImage ? (
                      <Image src={book.coverImage} alt={book.title} width={160} height={224} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-center text-gray-400"><BookOpen size={32} /></div>
                    )}
                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                      {status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{book.title}</h4>
                    <p className="text-xs text-gray-500 mb-3">by {book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{book.genre}</span>
                      {status === 'Available' ? (
                        <span className="text-xs font-semibold text-blue-600">Click to borrow →</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{status === 'On Loan' ? 'On loan' : status === 'Reserved' ? 'Reserved' : 'Unavailable'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-lg shadow text-black p-6">
        <h3 className="font-bold text-lg text-gray-700 mb-6">Activity Timeline ({timelineEvents.length})</h3>

        {timelineEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No activity yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Book</th>
                    <th className="pb-3 font-medium">Borrower</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(timelineEvents.length > 0 ? timelineEvents.slice(
                    (timelinePage - 1) * timelineRowsPerPage,
                    timelinePage * timelineRowsPerPage
                  ) : []).map(event => {
                    const label = event.type === 'borrowed' ? 'Borrowed' : event.type === 'returned' ? 'Returned' : 'Overdue';
                    return (
                      <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              event.type === 'borrowed' ? 'bg-blue-500' : event.type === 'returned' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {event.type === 'borrowed' ? (
                                <BookOpen size={12} className="text-white" />
                              ) : event.type === 'returned' ? (
                                <BookMarked size={12} className="text-white" />
                              ) : (
                                <BookX size={12} className="text-white" />
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              event.type === 'borrowed' ? 'bg-blue-100 text-blue-700' : event.type === 'returned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>{label}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {event.record.bookCoverImage && (
                              <Image src={event.record.bookCoverImage} alt="" width={24} height={32} className="object-cover rounded" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{event.record.bookTitle}</p>
                              <p className="text-xs text-gray-500">by {event.record.bookAuthor}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <User size={13} />
                            <span>{event.record.borrowerName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {formatDate(event.date.toISOString())}
                          </div>
                        </td>
                        <td className="py-3">
                          {event.type === 'borrowed' ? (
                            <span className="text-amber-600 text-xs font-medium">{formatDate(event.record.dueDate)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(timelinePage - 1) * timelineRowsPerPage + 1} to {Math.min(timelinePage * timelineRowsPerPage, timelineEvents.length)} of {timelineEvents.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTimelinePage(p => Math.max(p - 1, 1))}
                  disabled={timelinePage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(timelineEvents.length / timelineRowsPerPage) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setTimelinePage(page)}
                    className={`px-3 py-1.5 text-sm border rounded-md ${
                      timelinePage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setTimelinePage(p => Math.min(p + 1, Math.ceil(timelineEvents.length / timelineRowsPerPage)))}
                  disabled={timelinePage === Math.ceil(timelineEvents.length / timelineRowsPerPage)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
