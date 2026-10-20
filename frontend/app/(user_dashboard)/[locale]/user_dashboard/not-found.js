import NotFoundView from "@/components/shared/NotFoundView";

export default function NotFoundPage({ params }) {
  const locale = params?.locale || "en";

  return (
    <NotFoundView
      primaryLabel="View Plans"
      primaryHref={`/${locale}/user_dashboard/mining_plans`}
      homeHref={`/${locale}/user_dashboard`}
    />
  );
}
