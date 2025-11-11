import Link from 'next/link';
import './globals.css';

export const metadata = {
    title: '팝업 예약',
    description: '예약 페이지',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body className="bg-gray-50 min-h-screen">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-purple-700">🔮 팝업 예약</h1>
                    <nav className="space-x-4">
                        <Link
                            href="/"
                            className="text-purple-600 hover:underline"
                        >
                            예약하기
                        </Link>
                        <Link
                            href="/check"
                            className="text-purple-600 hover:underline"
                        >
                            예약 확인
                        </Link>
                    </nav>
                </header>
                <main className="p-6">{children}</main>
            </body>
        </html>
    );
}
