'use client';
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (username === 'bulnande' && password === 'bulnande1234') {
            setAuthenticated(true);
        } else {
            alert('인증 실패! 아이디 또는 비밀번호가 틀립니다.');
        }
    };

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg w-80">
                    <h1 className="text-2xl font-bold mb-6 text-center">Admin 로그인</h1>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                    >
                        로그인
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 사이드 메뉴 */}
            <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔥 Admin</h1>
                <nav className="flex flex-col gap-3">
                    <Link
                        href="/admin/create-slots"
                        className="px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition"
                    >
                        ⏱ 타임 생성
                    </Link>
                    <Link
                        href="/admin/reservation"
                        className="px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition"
                    >
                        📝 예약 현황
                    </Link>
                </nav>
            </aside>

            {/* 메인 컨텐츠 */}
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
