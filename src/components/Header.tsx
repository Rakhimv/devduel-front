import { useAuth } from "../hooks/useAuth";

const Header = () => {

    const { user, logout } = useAuth();

    return (
        <div className="w-full h-[100px] border-b-1 border-b-greyDD">

            <div className="flex gap-[20px]">
                <img className='h-6 w-6' src={user?.avatar || ""} />
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