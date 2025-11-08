import type { ReactNode } from "react"
import Header from "../components/Header"
// import GameStatusBanner from "../components/GameStatusBanner"

export const HeaderLayout = ({ children }: { children: ReactNode }) => {
    return <>
        <Header />
        {/* <GameStatusBanner /> */}
        {children}
    </>
}