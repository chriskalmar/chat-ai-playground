import { type Author } from "../utils/types";

type Props = {
  author: Author;
};

export const Avatar = ({ author }: Props) => {
  if (author === "AI") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
        AI
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-800 text-sm font-semibold text-white">
      User
    </div>
  );
};
