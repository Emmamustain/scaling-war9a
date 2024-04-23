import { cn } from "@/lib/utils";
import { ClassValue } from "class-variance-authority/types";
import { minidenticon } from "minidenticons";
import Image from "next/image";
import { useMemo } from "react";

interface MinidenticonImgProps {
  username: string;
  saturation?: number;
  lightness?: number;
  className?: ClassValue;
}

const MinidenticonImg = ({
  username,
  saturation = 100,
  lightness = 70,
  className,
  ...props
}: MinidenticonImgProps) => {
  const svgURI = useMemo(
    () =>
      "data:image/svg+xml;utf8," +
      encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness],
  );
  return (
    <Image
      src={svgURI}
      height={200}
      width={200}
      className={cn("h-full w-full object-fill", className)}
      alt={username}
      {...props}
    />
  );
};

export default MinidenticonImg;
