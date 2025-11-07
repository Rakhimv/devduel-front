import React from 'react';
import { Skeleton } from './Skeleton';

const ChatSkeleton: React.FC = () => {
  return (
    <div className="p-[10px] flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 flex-col min-w-0 space-y-2">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex justify-between items-end gap-2">
          <Skeleton className="h-3.5 w-[80%]" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const ChatListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ChatSkeleton key={index} />
      ))}
    </>
  );
};

export default ChatSkeleton;
