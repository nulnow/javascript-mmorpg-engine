import { useEffect, MutableRefObject } from "react";

export const useMouseDownOutside = (
  ref: MutableRefObject<HTMLElement>,
  handler = () => {},
  enabled = true,
): void => {
  useEffect(() => {
    if (enabled) {
      const clickHandler = (event: MouseEvent): void => {
        if (!ref.current.contains(event.target as any)) {
          handler();
        }
      };

      document.addEventListener("mousedown", clickHandler);

      return () => {
        document.removeEventListener("mousedown", clickHandler);
      };
    }
  }, [enabled]);
};
