import { Button } from "@wishhub/ui";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white text-3xl font-black italic">W</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-foreground">
                WishHub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Your universal wishlist for any e-commerce platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-2xl text-lg font-bold border-muted-foreground/20">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white rounded-3xl border border-muted-foreground/5 shadow-sm space-y-2">
                <h3 className="font-bold text-lg text-primary">Save Anything</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Use our browser extension to save products from any store with one click.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-muted-foreground/5 shadow-sm space-y-2">
                <h3 className="font-bold text-lg text-primary">Stay Organized</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Create custom wishlists for your projects, gifts, or dream purchases.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-muted-foreground/5 shadow-sm space-y-2">
                <h3 className="font-bold text-lg text-primary">Track Prices</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Coming soon: Get notified when prices drop on your saved items.</p>
            </div>
          </div>
      </div>
    </div>
  );
}
