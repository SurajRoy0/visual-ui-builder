import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-muted-foreground shadow-xs">
          <Sparkles className="size-3.5 text-primary" />
          <span>Visual React UI Builder</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Playfull Visual Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Design, assemble, and animate React components visually with clean code export.
          </p>
        </div>

        <div>
          <Link
            href="/editor"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Go to Project List</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
