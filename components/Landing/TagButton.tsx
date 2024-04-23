import { ClassNameValue, twMerge } from "tailwind-merge";

interface TagButtonProps {
  text?: string;
  className?: ClassNameValue;
}

export default function TagButton({
  text = "placeholder",
  className,
}: TagButtonProps) {
  return (
    <div
      className={twMerge(
        "font-bold  px-[20px] py-[10px] rounded-[30px] border-[1px] border-black hover:bg-blue-700  hover:border-white  duration-300 ",
        className
      )}
    >
      <a href="#">{text}</a>
    </div>
  );
}
