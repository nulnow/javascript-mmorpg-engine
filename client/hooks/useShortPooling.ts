import { useEffect, useState } from "react";

export const useShortPooling = <T, G = T>(
  object: T,
  poolingIntervalMS: number,
  selector: (object: T) => G = (x) => x as any as G,
): G => {
  const [value, setValue] = useState(selector(object));
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(selector(object));
    }, poolingIntervalMS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return value;
};
