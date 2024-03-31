import { useEffect, MutableRefObject, useRef } from "react";

export const useKeyDown = (
  handler: (event: KeyboardEvent) => void,
  element: Element = document as any as HTMLElement,
): void => {
  useEffect(() => {
    element.addEventListener("keydown", handler);

    return () => {
      element.removeEventListener("keydown", handler);
    };
  }, [element, handler]);
};
