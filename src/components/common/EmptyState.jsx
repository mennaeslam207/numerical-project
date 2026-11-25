import React from "react";
import { FolderOpen, Plus } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  title = "Nothing here yet",
  description = "Start by adding your first item.",
  icon: Icon,
  actionLabel,
  onAction,
}) => {
  const DisplayIcon = Icon || FolderOpen;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-5 bg-[#171426] border border-dashed border-purple-500/20 rounded-2xl">
      <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-5">
        <DisplayIcon
          size={36}
          className="text-purple-400"
        />
      </div>

      <h3 className="text-white text-lg font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-500 text-sm max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus size={17} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
