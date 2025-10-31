type AvatarWithStatusProps = {
  avatar?: string | null;
  name: string;
  isOnline?: boolean;
};

const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  avatar,
  name,
  isOnline = false
}) => {
  return (
    <div className="w-12 h-12 flex items-center justify-center relative">
      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center overflow-hidden ">
        {avatar ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}${avatar}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-black text-[20px] font-semibold">
            {name?.charAt(0)?.toUpperCase()}
          </span>
        )}

      </div>
      {isOnline &&
        <div
          className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary border-2 border-black"
        />
      }
    </div>
  );
};

export default AvatarWithStatus;

