"use client"
import Box from "@mui/material/Box"
import Image from "next/image"
import type { ReactNode } from "react"

interface AuthLayoutProps {
    children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Box
            sx={{
        width: "100%",
            minHeight: { xs: "auto", lg: "100vh" },
        display: "flex",
            flexDirection: { xs: "column", lg: "row" },
    }}
>
    <Box
        sx={{
        flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 6, md: 12 },
        px: { xs: 2, sm: 4 },
    }}
>
    <Box
        sx={{
        mx: "auto",
            width: { xs: "100%", sm: 350 },
        maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
    }}
>
    {children}
    </Box>
    </Box>
    <Box
    sx={{
        flex: 1,
            display: { xs: "none", lg: "block" },
        bgcolor: "grey.100",
            position: "relative",
    }}
>
    <Image
        src="/placeholder.svg?height=1080&width=1920"
    alt="Authentication Image"
    layout="fill"
    objectFit="cover"
    priority
    />
    </Box>
    </Box>
)
}
