import { Copy } from "lucide-react";
import MinidenticonImg from "../Atoms/random-pfp";

interface BusinessHeaderProps {
  name: string;
  slug: string;
}

export default function BusinessHeader({ name, slug }: BusinessHeaderProps) {
  return (
    <>
      <div className="h-[320px] bg-black"></div>
      <div className="-mt-12 ml-10 flex items-center gap-6">
        <div className="z-10 h-44 w-44 rounded-full border-2 bg-black">
          <MinidenticonImg username={name} />
        </div>
        <div className="mt-6">
          <p className="text-2xl font-semibold">{name}</p>
          <div className="flex gap-2 opacity-60">
            <p>{"war9a.com/business/" + slug}</p>
            <Copy size={18} />
          </div>
        </div>
      </div>
    </>
  );
}
