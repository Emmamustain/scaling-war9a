import { Copy } from "lucide-react";
import MinidenticonImg from "../Atoms/random-pfp";
import Image from "next/image";

interface BusinessHeaderProps {
  name: string;
  slug: string;
  image?: string;
  secondImage?: string;
}

export default function BusinessHeader({
  name,
  slug,
  image,
  secondImage,
}: BusinessHeaderProps) {
  return (
    <>
      <div className="h-[320px] bg-black">
        {secondImage && (
          <Image
            src={
              "https://aexlhjqpvatgjnnozbkw.supabase.co/storage/v1/object/public/business_images/" +
              secondImage
            }
            alt=""
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="mx-10 -mt-12 flex flex-col items-center gap-2 lg:flex-row lg:justify-start lg:gap-6 ">
        {/* <div className="flex w-full justify-center lg:justify-start "> */}
        <div className=" z-10 h-44 w-44 overflow-hidden rounded-full border-2 bg-black">
          {image ? (
            <Image
              src={
                "https://aexlhjqpvatgjnnozbkw.supabase.co/storage/v1/object/public/business_images/" +
                image
              }
              alt=""
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          ) : (
            <MinidenticonImg username={name} />
          )}
        </div>
        {/* </div> */}
        <div className="mt-6">
          <p className=" flex justify-center text-2xl font-semibold lg:justify-start">
            {name}
          </p>
          <div className="flex gap-2 opacity-60">
            <p>{"war9a.com/business/" + slug}</p>
            <Copy size={18} />
          </div>
        </div>
      </div>
    </>
  );
}
