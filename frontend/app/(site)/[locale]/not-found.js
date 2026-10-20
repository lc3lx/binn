import NotFoundView from "@/components/shared/NotFoundView";

export default function NotFoundPage({ params }) {
  const locale = params?.locale || "en";

  return (
    <NotFoundView
      primaryHref={`/${locale}#plan`}
      homeHref={`/${locale}`}
    />
  );
}
