import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import DecryptedText from "../effects/DecryptText"
import Spinner from "../effects/Spinner"

const TitleAnimation = () => {
    const [showText, setShowText] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShowText(true), 1700) // 1.2s анимация + 0.5s delay

        return () => {
            clearTimeout(timer)
        }
    }, [])

    return (
        <div className="w-full flex items-center flex-col gap-[100px] justify-center  h-screen">
            <motion.div
                className="logo-anim flex items-center h-[200px] overflow-hidden text-white text-[90px] font-bold"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <motion.img
                    src="/logo.svg"
                    className="w-[200px]"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1, 1], rotate: [0, 0, -90] }}
                    transition={{
                        duration: 1.2,
                        delay: 0.5,
                        times: [0, 0.5, 1],
                        ease: "easeInOut"
                    }}
                />
                {showText && (
                    <motion.div
                        className="flex  flex-col ml-4"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: -40 }}
                        transition={{ duration: 0.8 }}
                    >


                        <motion.p
                            initial={{ width: 0, y: 30 }}
                            animate={{ width: "max-content", y: 30 }}
                            transition={{ duration: 0.8 }}
                        >
                            <DecryptedText
                                text="ev"
                                speed={100}
                                maxIterations={20}
                                characters="ABCD1234{#/]"
                                className="revealed"
                                parentClassName="all-letters"
                                encryptedClassName="encrypted"
                            />
                        </motion.p>
                        <motion.p
                            initial={{ width: 0, y: -30 }}
                            animate={{ width: "max-content", y: -30 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <DecryptedText
                                text="uel"
                                speed={100}
                                maxIterations={20}
                                characters="ABCD1234!{#/]"
                                className="revealed"
                                parentClassName="all-letters"
                                encryptedClassName="encrypted"
                            />
                        </motion.p>
                    </motion.div>
                )}




            </motion.div>



            <motion.div
                className="flex text-primary gap-[10px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 3 }}
            >
                Загрузка <Spinner />
            </motion.div>
        </div>
    )
}

export default TitleAnimation
