import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md shadow-2xl border-border bg-card">
      <CardHeader className="space-y-4 pb-2 text-center">
        {/* Brand icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <ShieldCheck className="h-7 w-7 text-primary-foreground" />
        </div>

        {/* App name */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
