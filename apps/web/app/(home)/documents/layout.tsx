import AppProviders from "../app-providers";

export default function DocumentsLayout({children}: {children: React.ReactNode}) {
    return (
        <AppProviders scope="documents">
            {children}
        </AppProviders>
    );
}