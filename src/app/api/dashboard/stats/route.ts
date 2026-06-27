import connectToDatabase from '@/lib/mongo';
import Book from '@/model/book';
import User from '@/model/Users';
import Borrow from '@/model/borrow';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    const [totalUsers, totalBooks, borrowedBooks, allBorrows, books] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Book.countDocuments({ status: 'On Loan' }),
      Borrow.find().sort({ borrowDate: -1 }).lean(),
      Book.find().lean(),
    ]);

    const now = new Date();
    const overdueItems = await Borrow.countDocuments({
      status: 'Borrowed',
      dueDate: { $lt: now },
    });

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthBooks = await Book.countDocuments({ createdAt: { $lt: thisMonth } });
    const prevMonthBorrowed = await Borrow.countDocuments({ borrowDate: { $lt: thisMonth } });
    const prevMonthOverdue = await Borrow.countDocuments({ status: 'Borrowed', dueDate: { $lt: lastMonth } });

    const genreMap: Record<string, number> = {};
    for (const b of books) {
      genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
    }
    const totalGenreBooks = Object.values(genreMap).reduce((a, b) => a + b, 0);
    const genreDistribution = Object.entries(genreMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalGenreBooks) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayBorrow: Record<string, number> = {};
    const dayReturn: Record<string, number> = {};
    for (const d of dayLabels) { dayBorrow[d] = 0; dayReturn[d] = 0; }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    for (const r of allBorrows) {
      const d = new Date(r.borrowDate);
      if (d >= sevenDaysAgo) {
        dayBorrow[dayLabels[d.getDay()]] = (dayBorrow[dayLabels[d.getDay()]] || 0) + 1;
      }
      if (r.returnDate) {
        const rd = new Date(r.returnDate);
        if (rd >= sevenDaysAgo) {
          dayReturn[dayLabels[rd.getDay()]] = (dayReturn[dayLabels[rd.getDay()]] || 0) + 1;
        }
      }
    }

    const activityData = dayLabels.map(name => ({
      name,
      borrowed: dayBorrow[name],
      returned: dayReturn[name],
      active: Math.max(0, dayBorrow[name] - dayReturn[name]),
    }));

    return NextResponse.json({
      totalUsers,
      totalBooks,
      borrowedBooks,
      overdueItems,
      prevTotalBooks: prevMonthBooks || totalBooks,
      prevBorrowedBooks: prevMonthBorrowed || borrowedBooks,
      prevOverdueItems: prevMonthOverdue || overdueItems,
      genreDistribution,
      activityData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
