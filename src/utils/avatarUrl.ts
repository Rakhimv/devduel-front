/**
 * Get the full avatar URL, handling both local and external URLs
 * @param avatar - Avatar path or URL from database
 * @returns Full URL to display the avatar
 */
export const getAvatarUrl = (avatar: string | null | undefined): string => {
  const defaultAvatar = "/avatars/default.png";
  
  if (!avatar) {
    return `${import.meta.env.VITE_BACKEND_URL}${defaultAvatar}`;
  }
  
  // If avatar starts with http:// or https://, it's an external URL
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Otherwise, it's a local avatar path
  return `${import.meta.env.VITE_BACKEND_URL}${avatar}`;
};

