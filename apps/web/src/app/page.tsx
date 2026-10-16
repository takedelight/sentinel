import { Button } from "@sentinel/ui/components/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center gap-3">
      <Button>Get started</Button>
      <Button variant="outline">Documentation</Button>
    </main>
  );
}
