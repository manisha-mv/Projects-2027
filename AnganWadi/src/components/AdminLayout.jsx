import Sidebar from "./Sidebar";

export default function AdminLayout({ page, children }) {
  return (
    <div className="admin-layout">
      <Sidebar active={page} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
