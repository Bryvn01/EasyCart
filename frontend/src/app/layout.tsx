import '../index.css';

export const metadata = {
  title: 'EasyCart - Products',
  description: 'Shop our wide selection of products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
