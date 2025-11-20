"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-serif font-bold text-primary">
            ° OLIVE
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-serif uppercase tracking-[0.2em]">
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Recipe Index
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Course
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Diet
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Method
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-4 text-xs font-serif uppercase tracking-[0.3em]">
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Recipe Index
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Course
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Diet
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition"
            >
              Method
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
