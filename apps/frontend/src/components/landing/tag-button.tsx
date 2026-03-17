import { cn } from "@/lib/utils";

interface TagButtonProps {
  text?: string;
  className?: string;
}

export default function TagButton({
  text = "placeholder",
  className,
}: TagButtonProps) {
  return (
    <div
      className={cn(
        "font-bold px-[20px] py-[10px] rounded-[30px] border-[1px] border-black hover:bg-blue-700 hover:text-white hover:border-white duration-300 cursor-pointer",
        className,
      )}
    >
      <a href="#">{text}</a>
    </div>
  );
}
