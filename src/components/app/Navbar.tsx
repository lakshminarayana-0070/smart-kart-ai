import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Heart, User, LogOut, Camera, Wallet, Bot, Wand2, Brain, BrainCircuit } from "lucide-react";
import logo from "@/assets/smart-kart-logo.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Smart Kart AI home">
          <img
            src={logo}
            alt="Smart Kart AI"
            className="h-9 w-auto object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
          />
          <span className="sr-only">Smart Kart AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link to="/home" className="px-3 py-2 text-sm hover:text-primary transition">Home</Link>
          <Link to="/search" className="px-3 py-2 text-sm hover:text-primary transition">Search</Link>
          <Link to="/camera" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><Camera className="size-3.5" />Camera</Link>
          <Link to="/budget" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><Wallet className="size-3.5" />Budget AI</Link>
          <Link to="/assistant" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><Bot className="size-3.5" />Assistant</Link>
          <Link to="/studio" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><Wand2 className="size-3.5" />Studio</Link>
          <Link to="/knowledge" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><Brain className="size-3.5" />Knowledge</Link>
          <Link to="/shopping-memory" className="px-3 py-2 text-sm hover:text-primary transition flex items-center gap-1.5"><BrainCircuit className="size-3.5" />Memory</Link>
        </nav>

        <button
          onClick={() => navigate({ to: "/search" })}
          className="flex-1 max-w-md ml-auto flex items-center gap-2 h-10 px-4 rounded-full glass hover:border-primary/40 transition text-sm text-muted-foreground"
        >
          <Search className="size-4" />
          <span>Ask Smart Kart AI anything…</span>
        </button>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/wishlist" })}>
                <Heart className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/cart" })}>
                <ShoppingCart className="size-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><User className="size-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/shopping-memory" })}>Shopping Memory</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/wishlist" })}>Wishlist</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>Orders</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                    <LogOut className="size-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate({ to: "/login" })} className="bg-gradient-primary text-primary-foreground glow">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
