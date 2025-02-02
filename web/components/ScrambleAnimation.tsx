import ScrambleHover from "@/components/text/scramble-hover";
import { motion } from "framer-motion";

export default function Preview() {
  const models = ["SmartSage"];

  return (
    <div className="w-full h-full flex flex-col  justify-center items-end bg-background font-normal overflow-hidden py-20 px-8 sm:px-16 md:px-24 lg:px-32 text-right text-sm sm:text-lg md:text-xl">
      {models.map((model, index) => (
        <motion.div
          layout
          key={model}
          animate={{ opacity: [0, 1, 1], y: [10, 10, 0] }}
          transition={{
            duration: 0.1,
            ease: "circInOut",
            delay: index * 0.05 + 0.5,
            times: [0, 0.2, 1],
          }}
        >
          <ScrambleHover
            text={model}
            scrambleSpeed={50}
            maxIterations={8}
            useOriginalCharsOnly={true}
            className="cursor-pointer"
          />
        </motion.div>
      ))}
    </div>
  );
}
