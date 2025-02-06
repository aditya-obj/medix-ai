import "./globals.css";

export const metadata = {
  title: "Desease Risk Prediction",
  description: "Created by Philiswa Nakambule",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
