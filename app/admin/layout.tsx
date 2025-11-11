'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
