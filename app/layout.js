import './globals.css';

export const metadata = {
  title: 'Valentine Vibes 💖',
  description: 'A cute and romantic Valentine website'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
