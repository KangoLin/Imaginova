import { Navbar } from "@/components/navbar";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="detail" />
      {children}
    </div>
  );
}
