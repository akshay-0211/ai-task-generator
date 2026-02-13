import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'AI Tasks Generator - Mini Planning Tool',
    description: 'Generate project specifications with AI',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
