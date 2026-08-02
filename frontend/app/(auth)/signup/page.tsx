import Link from "next/link";
import { BookMarked } from "lucide-react";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { ROUTES } from "@/constants/routes";

export default function SignupPage() {
  return (
    <AuthCard icon={BookMarked} title="Create your account" subtitle="Start tracking what you read">
      <div className="flex flex-col gap-6">
        <SignupForm />
        <p className="text-center text-sm text-foreground/50">
          Already have an account?{" "}
          <Link href={ROUTES.login} className="font-medium text-brand-mid hover:text-brand-end">
            Log in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
