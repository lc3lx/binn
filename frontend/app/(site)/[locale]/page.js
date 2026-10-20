import dynamic from "next/dynamic";
import Hero from "./landing/Hero";
import SupportButton from "@/components/site/SupportButton";

const StatisticsPlan = dynamic(
  () => import("./landing/Statistics_plan/Statistics_plan"),
  {
    loading: () => <div className="h-24 w-full" />,
  },
);

const Faq = dynamic(() => import("./landing/Faq"), {
  loading: () => <div className="h-20 w-full" />,
});

const Footer = dynamic(() => import("./landing/Footer"), {
  loading: () => <div className="h-16 w-full" />,
});

export default function Page() {
  return (
    <div className="relative w-full overflow-x-hidden bg-black">
      <SupportButton className="fixed bottom-6 z-40 ltr:right-6 rtl:left-6" />
      <Hero />
      <StatisticsPlan />
      <Faq />
      <Footer />
    </div>
  );
}
