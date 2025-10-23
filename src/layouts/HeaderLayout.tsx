import type { ReactNode } from "react"
import Header from "../components/Header"

export const HeaderLayout = ({ children }: { children: ReactNode }) => {
    return <>
        <Header />
        {children}
    </>
}