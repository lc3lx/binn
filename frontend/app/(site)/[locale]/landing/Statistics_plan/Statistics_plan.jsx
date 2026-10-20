import Mining_plan from "../Mining_plan";
import Image from "next/image";
import Statistics from "../Statistics";

export default function Statistics_plan() {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* High performance raster background (Prevents SVG filter re-rasterization on scroll) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/bg.png"
          alt="background"
          fill
          priority={false}
          className="object-cover opacity-50 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <Statistics />

      <Mining_plan />
    </div>
  );
}
