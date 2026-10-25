"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function SiteLoadingScreen({ isVisible = true }) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="site-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "var(--background)" }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,209,0,0.12),transparent_45%)]"
            animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -10 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-30%] rounded-full bg-primary/20 blur-3xl"
                animate={{ scale: [1, 1.16, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                aria-hidden="true"
                className="absolute inset-y-6 -left-24 w-28 rotate-[20deg] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-md"
                animate={{ x: [-40, 320] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  repeatDelay: 0.25,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                animate={{ y: [0, -8, 0], filter: ["brightness(1)", "brightness(1.18)", "brightness(1)"] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Image
                  src="/logo.svg"
                  alt="ETG RIDE Loading"
                  width={170}
                  height={170}
                  priority
                  className="h-auto w-[132px] sm:w-[170px] select-none"
                />
              </motion.div>
            </motion.div>

            <div className="mt-8 h-px w-28 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-14 rounded-full bg-primary"
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
