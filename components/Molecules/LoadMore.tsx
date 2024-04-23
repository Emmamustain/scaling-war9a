import { Plus, PlusSquare } from "lucide-react";

interface LoadMoreProps {
  action: () => void;
}

export default function LoadMore({ action }: LoadMoreProps) {
  return (
    <div
      onClick={action}
      className="h-full rounded bg-neutral-900 p-2 duration-150 hover:cursor-pointer hover:opacity-80 dark:bg-neutral-50"
    >
      <div className="flex h-[300px] w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Plus size={35} />
      </div>
      <div className="flex- mb-2 mt-4 flex items-center justify-between text-white dark:text-black">
        <p className="text-lg">Load More</p>
        <p className="opacity-80">
          <PlusSquare />
        </p>
      </div>
      <p className="text-base text-white opacity-60 dark:text-black">
        Click Here to load more businesses
      </p>
    </div>
  );
}
