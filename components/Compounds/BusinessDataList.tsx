import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "../ui/badge";
import Map from "@/components/Molecules/Map"

interface BusinessDataListProps {
  name: string;
  categories: {
    category_id: string;
    name: string;
  }[];
  phone: string;
  reputation: { positive: number; negative: number };
  description: string;
  marker: {lat:number, lng: number};
}

export default function BusinessDataList({
  name,
  categories,
  phone,
  reputation,
  description,
  marker,
}: BusinessDataListProps) {
  return (
    <div className="mt-6 px-0 sm:px-6">
      <Collapsible>
        <CollapsibleTrigger className="duration-150 hover:scale-[0.985] hover:opacity-70">
          <div className="px-2 sm:px-0">
            <h3 className="flex text-base font-semibold text-gray-900 ">
              Business Information
              <ChevronDown />
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Business details and Applications.
            </p>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Business Name
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {name}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Categories
                </dt>
                <dd className="mt-1 space-x-2 text-sm capitalize leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {categories.map((category, index) => (
                    <Badge key={index}>{category.name}</Badge>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Phone number
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {phone}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Reputation
                </dt>
                <dd className="mt-1 flex gap-6 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center gap-1">
                    {reputation.positive} <ThumbsUp color="#baceab" size={18} />
                  </div>

                  <div className="flex items-center gap-1">
                    {reputation.negative}{" "}
                    <ThumbsDown color="#ceabab" size={18} />
                  </div>
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  About
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {description}
                </dd>
              </div>
            </dl>
            <div className="h-[800px] w-[800px] bg-red-500">

                  <Map marker={marker} center={marker}/>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Queue */}
    </div>
  );
}
