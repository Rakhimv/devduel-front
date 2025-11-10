export const getAvatarUrl = (avatar: string | null | undefined): string => {
  const defaultAvatar = "/avatars/default.png";
  
  if (!avatar) {
    return `${import.meta.env.VITE_BACKEND_URL}${defaultAvatar}`;
  }
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  return `${import.meta.env.VITE_BACKEND_URL}${avatar}`;
};

