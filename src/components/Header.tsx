import { useAuth } from "../hooks/useAuth";

const Header = () => {

    const { user, logout } = useAuth();

    return (
        <div className="w-full max-h-[100px] h-[100px] border-b-1 border-b-greyDD overflow-hidden p-[10px]">

            <div className="flex gap-[20px] items-center h-full">
                <img className='w-[80px] h-[80px]' src={user?.avatar || "/default.png"} />
                <p className='text-blueDD font-dd font-bold text-[30px]'>{user?.id}</p>
                <p className='text-primary font-dd font-bold text-[30px]'>{user?.name}</p>
                <p
                    onClick={logout}
                    className='text-redDD font-dd font-bold text-[30px] cursor-pointer'>Выйти</p>
            </div>

        </div>
    )
}

export default Header