import NotFoundView from "@/components/shared/NotFoundView";

export default function NotFoundPage({ params }) {
  const locale = params?.locale || "en";

  return (
    <NotFoundView
      primaryLabel="Create Account"
      primaryHref={`/${locale}/user_auth/signup`}
      homeHref={`/${locale}/user_auth/login`}
    />
  );
}
