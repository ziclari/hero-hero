import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { animations } from "../sceneRenderer/animations";

export default function MotionWrapper({ children, animate, delay = 0, style }) {
  const controls = useAnimationControls();

  useEffect(() => {
    const runSequence = async () => {
      let animList = [];
      let repeatInfinite = false;

      if (animate?.sequence) {
        animList = animate.sequence;
        repeatInfinite = animate.repeat === "infinite";
      } else if (Array.isArray(animate)) {
        animList = animate;
        repeatInfinite = animate.infinite === true;
      } else if (typeof animate === "string") {
        animList = [animate];
        repeatInfinite = animate?.infinite === true;
      }

      if (animList.length === 0) {
        const fallback = animations.fadeUp;
        if (fallback.initial) await controls.set(fallback.initial);
        await controls.start({
          ...fallback.animate,
          transition: { ...fallback.transition, delay },
        });
        return;
      }

      for (let j = 0; j < animList.length; j++) {
        const animName = animList[j];
        const anim = animations[animName] || animations.fadeUp;
        const baseTransition = anim.transition || {};

        if (repeatInfinite && j === animList.length - 1) {
          controls.start({
            ...anim.animate,
            transition: { ...baseTransition, delay, repeat: Infinity },
          });
        } else {
          if (anim.initial) await controls.set(anim.initial);
          await controls.start({
            ...anim.animate,
            transition: { ...baseTransition, delay },
          });
        }
      }
    };
    runSequence();
  }, [animate, animations, controls, delay]);

  return (
    <motion.div
      animate={controls}
      style={{
        opacity: animate === "none" ? 1 : 0,
        pointerEvents: animate === "none" ? "auto" : "none",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
