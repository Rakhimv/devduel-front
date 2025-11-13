export const getAvatarUrl = (avatar: string | null | undefined, cacheBust?: boolean): string => {
  const defaultAvatar = "/avatars/default.png";
  const timestamp = cacheBust ? `?t=${Date.now()}` : '';
  
  if (!avatar) {
    return `${import.meta.env.VITE_BACKEND_URL}${defaultAvatar}${timestamp}`;
  }
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar + timestamp;
  }
  
  return `${import.meta.env.VITE_BACKEND_URL}${avatar}${timestamp}`;
};

