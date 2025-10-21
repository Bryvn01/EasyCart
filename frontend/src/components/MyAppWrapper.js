import PlausibleProvider from 'next-plausible';

export default function MyAppWrapper({ children }) {
  return (
    <PlausibleProvider domain="easycart.example.com">
      {children}
    </PlausibleProvider>
  );
}
