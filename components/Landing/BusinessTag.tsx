import { ChevronRight } from "lucide-react";
import { ReactElement } from "react";
interface BusinessTagProps {
  text: string;
  icon?: ReactElement;
}
export default function BusinessTag({ text, icon }: BusinessTagProps) {
  return (
    <div>
      <a href="#" className="flex gap-6 items-center">
        {icon} {text} <ChevronRight />
      </a>
    </div>
  );
}
