import { Link } from "react-router-dom"
import { getGitHubUrl, getGoogleUrl, getYandexUrl } from "../../utils/getOAuthURL"
import { FaGithub, FaGoogle, FaYandex } from "react-icons/fa";


const OAuthButtons = () => {
    return (
        <div className="w-full flex justify-center items-center gap-[16px]">
            <Link to={getGitHubUrl('/')}>
                <div className="cursor-pointer p-[10px] w-max border-white border-1 text-white hover:bg-white hover:text-black transition-all">
                    <FaGithub size={30} className="" />
                </div>
            </Link>
            <Link to={getYandexUrl('/')}>
                <div className="cursor-pointer p-[10px] w-max border-orangeDD border-1 text-redDD hover:bg-orangeDD hover:text-redDD transition-all">
                    <FaYandex size={30} className="" />
                </div>
            </Link>
            <Link to={getGoogleUrl('/')}>
                <div className="cursor-pointer p-[10px] w-max border-primary border-1 text-blueDD hover:bg-primary hover:text-black transition-all">
                    <FaGoogle size={30} className="" />
                </div>
            </Link>
        </div>
    )
}

export default OAuthButtons