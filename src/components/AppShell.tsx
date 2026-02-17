import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { AppFooter } from "./AppFooter";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navigation />
      <main id="main-content" className="app-main flex-grow-1" tabIndex={-1}>
        {children}
      </main>
      <AppFooter />
    </div>
  );
};
