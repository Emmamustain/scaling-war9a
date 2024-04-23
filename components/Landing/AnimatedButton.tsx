import { ClassNameValue, twMerge } from "tailwind-merge";

interface AnimatedButtonProps {
  text: string;
}

export default function AnimatedButton({
  text = "placeholder",
}: AnimatedButtonProps) {
  return (
    <div
      className={twMerge(
        "hover:text-black hover:border-t-[2px] border-neutral-800 border-t-[1px] hover:mb-[10px] duration-200 pt-[10px]"
      )}
    >
      <a href="#">{text}</a>
    </div>
  );
}
