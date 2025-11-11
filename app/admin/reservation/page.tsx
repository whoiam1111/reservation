'use client';
import React, { useEffect, useState } from 'react';

interface Reservation {
    id: number;
    user_name: string;
    phone: string;
    companions: number;
    team_name: string;
    timeslot_id: number;
    start_time: string;
    end_time: string;
}

interface TimeSlotGroup {
    timeslot: { id: number; start_time: string; end_time: string };
    reservations: Reservation[];
}

export default function AdminReservations() {
    const [groups, setGroups] = useState<TimeSlotGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [canceling, setCanceling] = useState<number | null>(null); // 취소 중인 예약 id

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reservation'); // 서버에서 예약 리스트 반환
            const data: Reservation[] = await res.json();

            // 타임별 그룹화
            const grouped: TimeSlotGroup[] = [];
            const map = new Map<number, TimeSlotGroup>();

            data.forEach((r) => {
                if (!map.has(r.timeslot_id)) {
                    map.set(r.timeslot_id, {
                        timeslot: { id: r.timeslot_id, start_time: r.start_time, end_time: r.end_time },
                        reservations: [],
                    });
                }
                map.get(r.timeslot_id)?.reservations.push(r);
            });

            setGroups(Array.from(map.values()));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleCancel = async (reservationId: number) => {
        if (!confirm('정말로 이 예약을 취소하시겠습니까?')) return;

        setCanceling(reservationId);
        try {
            const res = await fetch(`/api/admin/reservations/${reservationId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('예약이 취소되었습니다.');
                fetchReservations();
            } else {
                const err = await res.json();
                alert(`취소 실패: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('취소 중 오류 발생');
        } finally {
            setCanceling(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">📝 예약 현황 (Admin)</h1>

            {loading && <p className="text-center text-gray-500">로딩 중...</p>}

            <div className="space-y-6">
                {groups.map((group) => (
                    <div
                        key={group.timeslot.id}
                        className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
                    >
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            {new Date(group.timeslot.start_time).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}{' '}
                            ~{' '}
                            {new Date(group.timeslot.end_time).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </h2>

                        {group.reservations.length === 0 ? (
                            <p className="text-gray-400">예약자가 없습니다.</p>
                        ) : (
                            <div className="space-y-3">
                                {group.reservations.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        <div>
                                            <p className="font-medium">{r.user_name}</p>
                                            <p className="text-sm text-gray-600">
                                                {r.team_name} / 연락처: {r.phone} / 동행자: {r.companions}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(r.id)}
                                            disabled={canceling === r.id}
                                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                                        >
                                            {canceling === r.id ? '취소 중...' : '취소'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
