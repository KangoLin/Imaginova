import { AdminNavbar } from "@/components/admin-navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <main className="pt-14">{children}</main>
    </>
  );
}
