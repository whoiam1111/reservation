'use client';
import React, { useState } from 'react';

export default function AdminPage() {
    const [msg, setMsg] = useState('');

    async function createDefaultDay(dateIso?: string) {
        const date = dateIso ? new Date(dateIso) : new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const requests: Promise<Response>[] = [];
        for (let h = 13; h < 19; h++) {
            const start = new Date(year, month, day, h);
            const end = new Date(year, month, day, h + 1);
            requests.push(
                fetch('/api/times', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start: start.toISOString(),
                        end: end.toISOString(),
                        sajuCapacity: 2,
                        tarotCapacity: 2,
                    }),
                })
            );
        }

        await Promise.all(requests);
        setMsg('13시~19시 슬롯 생성 완료!');
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>관리자 페이지</h1>
            <button onClick={() => createDefaultDay()}>오늘 슬롯 생성</button>
            {msg && <p>{msg}</p>}
        </main>
    );
}
