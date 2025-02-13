import "@/app/globals.css";
import Navbar from "@/components/Navbar";
export const metadata = {
  title: "Medix AI - Disease Risk Prediction",
  description: "Created by Philiswa Nakambule",
  icons: {
    icon: "/favicon.png",
  },
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
