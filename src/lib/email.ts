import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendBorrowConfirmation({
  to,
  bookTitle,
  bookAuthor,
  borrowerName,
  borrowDate,
  dueDate,
}: {
  to: string;
  bookTitle: string;
  bookAuthor: string;
  borrowerName: string;
  borrowDate: string;
  dueDate: string;
}) {
  const formattedBorrow = new Date(borrowDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const formattedDue = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  await transporter.sendMail({
    from: `"Book Inventory" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Book Borrowed: "${bookTitle}"`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="font-size:20px;color:#1f2937;margin:0;">📚 Book Borrowed</h1>
        </div>
        <p style="color:#374151;font-size:14px;">Hello <strong>${borrowerName}</strong>,</p>
        <p style="color:#374151;font-size:14px;">You have successfully borrowed the following book:</p>
        <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
          <h2 style="font-size:16px;color:#111827;margin:0 0 4px;">${bookTitle}</h2>
          <p style="color:#6b7280;font-size:13px;margin:0;">by ${bookAuthor}</p>
        </div>
        <table style="width:100%;font-size:13px;color:#374151;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Borrow Date</td>
            <td style="padding:6px 0;font-weight:600;text-align:right;">${formattedBorrow}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Due Date</td>
            <td style="padding:6px 0;font-weight:600;text-align:right;color:#d97706;">${formattedDue}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px;">
          Please return the book by the due date to avoid penalties.
        </p>
      </div>
    `,
  });
}
