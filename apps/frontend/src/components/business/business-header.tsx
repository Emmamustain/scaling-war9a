import { Copy } from "lucide-react";
import MinidenticonImg from "@/components/atoms/minidenticon-img";
import Image from "next/image";

interface BusinessHeaderProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
}

export default function BusinessHeader({
  name,
  slug,
  logoUrl,
  coverUrl,
}: BusinessHeaderProps) {
  return (
    <>
      {/* Cover */}
      <div className="relative h-[320px] overflow-hidden bg-black">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      {/* Logo + Name */}
      <div className="mx-10 -mt-12 flex flex-col items-center gap-2 lg:flex-row lg:justify-start lg:gap-6">
        <div className="z-10 h-44 w-44 overflow-hidden rounded-full border-2 bg-black">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          ) : (
            <MinidenticonImg username={name} />
          )}
        </div>
        <div className="mt-6">
          <p className="flex justify-center text-2xl font-semibold lg:justify-start">
            {name}
          </p>
          <div className="flex cursor-pointer gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <p>{"war9a.localhost/business/" + slug}</p>
            <Copy size={18} />
          </div>
        </div>
      </div>
    </>
  );
}
