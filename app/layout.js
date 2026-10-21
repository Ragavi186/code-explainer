import "./globals.css";

export const metadata = {
  title: "DevChat | Advanced AI Assistant",
  description: "AI Coding Assistant and Practice Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#131314] text-[#e3e3e3] font-sans antialiased h-screen flex flex-col overflow-hidden">
        {/* Global top nav removed - Navigation moved to Sidebar */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </body>
    </html>
  );
}
