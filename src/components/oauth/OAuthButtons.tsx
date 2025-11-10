import { Link } from "react-router-dom"
import { getGitHubUrl, getGoogleUrl, getYandexUrl } from "../../utils/getOAuthURL"
import { FaGithub, FaGoogle, FaYandex } from "react-icons/fa";
import { motion } from "framer-motion"

const OAuthButtons = () => {
    return (
        <div className="w-full flex justify-center items-center gap-[16px]">
            <motion.div 
            initial={{y: -5, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.4, delay: 0.8, ease: "easeInOut"}}
            >
                <Link to={getGitHubUrl('/')}>
                    <div className="cursor-pointer p-[10px] w-max border-white border-1 text-white hover:bg-white hover:text-black transition-all">
                        <FaGithub size={30} className="" />
                    </div>
                </Link>
            </motion.div>
            <motion.div 
            initial={{y: -5, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.4, delay: 1, ease: "easeInOut"}}
            >
                <Link to={getYandexUrl('/')}>
                    <div className="cursor-pointer p-[10px] w-max border-orangeDD border-1 text-redDD hover:bg-orangeDD hover:text-redDD transition-all">
                        <FaYandex size={30} className="" />
                    </div>
                </Link>
            </motion.div>
            <motion.div 
            initial={{y: -5, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.4, delay: 1.2, ease: "easeInOut"}}
            >
                <Link to={getGoogleUrl('/')}>
                    <div className="cursor-pointer p-[10px] w-max border-primary border-1 text-blueDD hover:bg-primary hover:text-black transition-all">
                        <FaGoogle size={30} className="" />
                    </div>
                </Link>
            </motion.div>
        </div >
    )
}

export default OAuthButtons