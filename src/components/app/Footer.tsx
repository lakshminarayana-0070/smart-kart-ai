import { Sparkles } from "lucide-react";
export function Footer() {
  return (
    <footer className="mt-24 border-t glass">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-lg bg-gradient-primary grid place-items-center"><Sparkles className="size-3.5 text-primary-foreground" /></div>
            <span className="font-display font-bold">Smart Kart <span className="text-gradient">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">The next-generation AI commerce platform. Personalized shopping powered by intelligence.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Trending</li><li>Categories</li><li>Flash deals</li><li>New arrivals</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">AI Features</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Smart Search</li><li>Camera Shopping</li><li>Budget Assistant</li><li>Review AI</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Privacy</li><li>Terms</li><li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Smart Kart AI. Built with intelligence.
      </div>
    </footer>
  );
}
