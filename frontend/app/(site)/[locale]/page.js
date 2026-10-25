import dynamic from "next/dynamic";
import Hero from "./landing/Hero";
import SupportButton from "@/components/site/SupportButton";
import ReferralCodeCapture from "@/components/ReferralCodeCapture";
import Statistics from "./landing/Statistics";
import Mining_plan from "./landing/Mining_plan";
import HowItWorks from "./landing/HowItWorks";
import ReferralRewardBanner from "./landing/ReferralRewardBanner";

const Faq = dynamic(() => import("./landing/Faq"), {
  loading: () => <div className="h-20 w-full" />,
});

const Footer = dynamic(() => import("./landing/Footer"), {
  loading: () => <div className="h-16 w-full" />,
});

export default function Page() {
  return (
    <div className="relative w-full overflow-x-hidden bg-[#060a12]">
      <ReferralCodeCapture />
      <SupportButton className="fixed bottom-6 z-40 ltr:right-6 rtl:left-6" />

      {/* 1. Main Hero Section */}
      <Hero />

      {/* 2. Platform Advantages & Features */}
      <Statistics />

      {/* 3. Electric Scooter Fleet Catalog (E1 to E6) & Live Simulator */}
      <Mining_plan />

      {/* 4. How It Works (4 Quick Steps) */}
      <HowItWorks />

      {/* 5. $100 Referral Reward Milestone Banner */}
      <ReferralRewardBanner />

      {/* 6. Frequently Asked Questions */}
      <Faq />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
