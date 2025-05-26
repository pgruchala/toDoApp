'use client'
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
