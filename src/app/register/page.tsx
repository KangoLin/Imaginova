"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_60%)] opacity-8 pointer-events-none" />
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">Imaginova</Link>
      </div>
      <Card className="w-full max-w-sm animate-scale-in shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl font-bold">Create an account</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-0.5">Get started with Imaginova</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground">Name</label>
              <Input id="name" name="name" required placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">Email</label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">Password</label>
              <Input id="password" name="password" type="password" required minLength={6} placeholder="At least 6 characters" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
