import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/** Stop the WebGL loop when the tab is hidden or UI overlays block the scene. */
export default function RenderBudget({ renderActive }: { renderActive: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    const sync = () => {
      const visible = document.visibilityState === "visible";
      setFrameloop(renderActive && visible ? "always" : "never");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("blur", sync);
    window.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", sync);
      window.removeEventListener("focus", sync);
    };
  }, [renderActive, setFrameloop]);

  return null;
}
