import { PageContainer } from "@/components/shared/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
        Project
        <span className="text-primary"> MatchMaker</span>
      </h1>

      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8">
        Find teammates for hackathons, college projects, startup ideas, research work, and open-source contributions.
      </p>

      <div className="flex items-center gap-4">
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,174,213,0.3)] hover:shadow-[0_0_25px_rgba(6,174,213,0.5)] transition-all",
          )}
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-border hover:bg-muted")}
        >
          Sign In
        </Link>
      </div>
    </PageContainer>
  );
}
