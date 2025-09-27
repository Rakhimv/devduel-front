type LogoSvgT = {
    className?: string
}

export const LogoSvg = ({className}: LogoSvgT) => {
    return (
        <img className={className} src="./logo.svg" />
    )
}