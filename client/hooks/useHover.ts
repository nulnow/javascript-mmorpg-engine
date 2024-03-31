import { useState } from "react";

export const useHover = (): {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};
