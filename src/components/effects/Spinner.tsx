import { useEffect, useState } from "react";

export default function Spinner() {
  const frames = ["|", "/", "-", "\\"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
      <span className="font-dd font-bold">{frames[index]}</span>
  );
}
