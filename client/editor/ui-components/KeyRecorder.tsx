import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useMouseDownOutside } from "../../hooks/useMouseDownOutside";
import { useKeyDown } from "../../hooks/useKeyDown";

export const KeyRecorder: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = forwardRef(({ value, onChange }, ref) => {
  const selfRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      setFocused: (value: boolean) => {
        // setFocused(value);
        selfRef.current.focus();
      },
    };
  });

  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);

  useMouseDownOutside(selfRef, () => {
    setActive(false);
  });

  useKeyDown((event) => {
    if (focused) {
      if (!active && event.code === "Space") {
        setActive((v) => !v);
      } else if (active) {
        onChange(event.code);
        setActive(false);
      }
    }
  }, selfRef.current);

  return (
    <div
      tabIndex={0}
      ref={selfRef}
      className={`flex justify-center items-center bg-gray-900 focus:outline-0 rounded-md border-2 ${(() => {
        if (active) return "border-red-500";
        if (focused) return "border-blue-600";
        return "border-transparent";
      })()}`}
      style={{ height: 25 }}
      onClick={() => {
        setActive(true);
      }}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
        setActive(false);
      }}
    >
      <span className="pl-6 pr-6">{value}</span>
    </div>
  );
});
KeyRecorder.displayName = "KeyRecorder";
