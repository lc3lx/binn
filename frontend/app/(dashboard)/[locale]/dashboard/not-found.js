import NotFoundView from "@/components/shared/NotFoundView";

export default function NotFoundPage({ params }) {
  const locale = params?.locale || "en";

  return (
    <NotFoundView
      primaryLabel="Manage Plans"
      primaryHref={`/${locale}/dashboard-x9cBqC12/mining_plans`}
      homeHref={`/${locale}/dashboard-x9cBqC12`}
    />
  );
}
