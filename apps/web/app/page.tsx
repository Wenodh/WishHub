import { Button } from "@wishhub/ui";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">WishHub</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        Your universal wishlist for any e-commerce platform.
      </p>
      <Button size="lg">Get Started</Button>
    </div>
  );
}
