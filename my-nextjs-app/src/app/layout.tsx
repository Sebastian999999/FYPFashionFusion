// app/layout.tsx (or in a specific folder like app/home/layout.tsx)
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title>My Next.js App</title>
        {/* You can include other head tags here */}
      </head>
      <body>
        {children} {/* This will render the content of the page */}
      </body>
    </html>
  );
};

export default Layout;
