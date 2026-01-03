"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Atrium" },
  { href: "/library", label: "Bibliotheca" },
  { href: "/readingplan", label: "Calendarium" },
  { href: "/ratings", label: "Iudicium" },
];

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-lg font-semibold tracking-tight">
            In Vino Veritas
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            Bacchanterne
          </span>
        </Link>

        {/* Nav */}
        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2 text-xs font-medium uppercase tracking-widest transition-colors",
                        "hover:bg-muted hover:text-foreground",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side (optional) */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground"></div>
      </div>
    </header>
  );
}
