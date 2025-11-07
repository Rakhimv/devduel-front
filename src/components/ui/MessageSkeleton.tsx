import React from 'react';
import { Skeleton } from './Skeleton';

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="mb-4 flex items-end gap-2">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="bg-primary-bg relative p-[10px] py-[10px] rounded-[10px] space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3.5 w-[200px]" />
        <div className="flex justify-end gap-1">
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
};

export const MessageListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} />
      ))}
    </>
  );
};

export default MessageSkeleton;
