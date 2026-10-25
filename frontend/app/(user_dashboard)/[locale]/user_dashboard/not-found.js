import NotFoundView from "@/components/shared/NotFoundView";

export default function NotFoundPage({ params }) {
  const locale = params?.locale || "en";

  return (
    <NotFoundView
      primaryLabel="Energy Models"
      primaryHref={`/${locale}/user_dashboard/my_plans`}
      homeHref={`/${locale}/user_dashboard`}
    />
  );
}
