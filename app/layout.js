import './globals.css';

export const metadata = {
  title: 'Valentine 💘',
  description: 'A cute romantic valentine website'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
