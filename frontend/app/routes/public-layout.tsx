import { Outlet } from "react-router";

import { PublicFooter, PublicHeader } from "~/components/layout";

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
