import "@/app/globals.css";
import Navbar from "@/components/Navbar";
export const metadata = {
  title: "Desease Risk Prediction",
  description: "Created by Philiswa Nakambule",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
