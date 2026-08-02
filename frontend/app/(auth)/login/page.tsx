import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  return (
    <AuthCard icon={BookOpen} title="Welcome back" subtitle="Log in to pick up where you left off">
      <div className="flex flex-col gap-6">
        <LoginForm />
        <p className="text-center text-sm text-foreground/50">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.signup} className="font-medium text-brand-mid hover:text-brand-end">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
