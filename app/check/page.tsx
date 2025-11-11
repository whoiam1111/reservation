'use client';
import React, { useState } from 'react';

interface Reservation {
    id: number;
    user_name: string;
    phone: string;
    companions: number;
    team_name: string;
    start_time: string;
    end_time: string;
    paid: boolean; // 입금 확인 여부
}

export default function CheckReservation() {
    const [form, setForm] = useState({ name: '', phone: '' });
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!form.name || !form.phone) return alert('이름과 휴대폰을 입력하세요');
        setLoading(true);
        try {
            const res = await fetch(`/api/reservation/check?name=${form.name}&phone=${form.phone}`);
            const data = await res.json();
            if (data.error) {
                alert(data.error);
            } else {
                setReservations(data.reservations);
            }
        } catch (err) {
            console.error(err);
            alert('조회 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };
    console.log(reservations, '?reservationsreservations');
    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">예약 확인</h1>

            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="이름"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border px-3 py-1 rounded flex-1"
                />
                <input
                    type="text"
                    placeholder="휴대폰"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="border px-3 py-1 rounded flex-1"
                />
                <button
                    onClick={handleCheck}
                    className="px-3 py-1 bg-purple-600 text-white rounded"
                    disabled={loading}
                >
                    {loading ? '조회 중...' : '예약 확인'}
                </button>
            </div>

            {reservations.length > 0 ? (
                <ul className="space-y-4">
                    {reservations.map((r) => {
                        const start = new Date(r.start_time);
                        const end = new Date(r.end_time);
                        const now = new Date();
                        const diffDays = Math.floor((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                            <li
                                key={r.id}
                                className="border p-4 rounded shadow bg-white"
                            >
                                <p className="font-semibold">
                                    {r.team_name} / {r.companions}명
                                </p>
                                <p>
                                    시간: {start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~{' '}
                                    {end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {r.paid ? (
                                    <p className="text-green-600 font-medium mt-2">
                                        ✅ 입금 확인 완료! 환불은 예약 2일 전까지만 가능합니다. 안내 문자 보내드립니다.
                                    </p>
                                ) : (
                                    <div className="mt-2 space-y-1 text-red-600">
                                        <p>🏦 은행: 신한</p>
                                        <p>💳 계좌번호: 110-412-869073</p>
                                        <p>👤 예금주: 곽채영</p>
                                        <p>⚠️ 신청 후 2일 이내 입금되지 않으면 예약이 자동 취소됩니다.</p>
                                        {diffDays < 2 && diffDays >= 0 && (
                                            <p>⏳ 예약까지 {diffDays}일 남았습니다. 입금 잊지 마세요!</p>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>조회된 예약이 없습니다.</p>
            )}
        </div>
    );
}
