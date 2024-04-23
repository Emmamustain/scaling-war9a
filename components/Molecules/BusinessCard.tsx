import ConvertTimeToString from "@/utils/time-to-string";
import MinidenticonImg from "../Atoms/random-pfp";
import { getAverageTime } from "@/database/queries";

interface BusinessCardProps {
  image?: string;
  name: string;
  slug: string;
  address: string;
  avgWaitTime?: number;
}

const BusinessCard = ({
  image,
  name,
  slug,
  address = "No Address",
  avgWaitTime = 0,
}: BusinessCardProps) => {
  // const serviceData = getBusinessServices(business_id)
  // const esimated_waiting_time = await getAverageTime();
  return (
    <a
      href={"/business/" + slug}
      className="rounded bg-neutral-900 p-3 duration-150 hover:cursor-pointer hover:opacity-80 dark:bg-neutral-50"
    >
      <div className="h-[300px] w-full bg-neutral-50 dark:bg-neutral-900">
        <MinidenticonImg username={name} />
      </div>
      <div className="flex- mb-2 mt-4 flex items-center justify-between text-white dark:text-black">
        <p className="text-lg">{name}</p>
        <p className="opacity-80">Wait: {ConvertTimeToString(avgWaitTime)}</p>
      </div>
      <p className="text-base text-white opacity-60 dark:text-black">
        {address}
      </p>
    </a>
  );
};

export default BusinessCard;
