'use client';
import React, { useEffect, useState } from 'react';

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    teams: Record<string, number>;
    disabled: boolean;
}

const teamColors: Record<string, string> = {
    사주: 'bg-pink-500 hover:bg-pink-600',
    타로: 'bg-purple-500 hover:bg-purple-600',
};

export default function SlotList() {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', companions: 1 });
    const [bookingLoading, setBookingLoading] = useState(false);

    const [showPaymentInfo, setShowPaymentInfo] = useState(false);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/times');
            const data = await res.json();
            const mapped = data.map((slot: any) => {
                const allBooked = Object.values(slot.teams as Record<string, number>).every(
                    (capacity) => capacity <= 0
                );
                return { ...slot, disabled: allBooked };
            });
            setSlots(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const openModal = (slot: TimeSlot, teamName: string) => {
        setSelectedSlot(slot);
        setSelectedTeam(teamName);
        setForm({ name: '', phone: '', companions: 1 });
        setModalOpen(true);
        setShowPaymentInfo(false);
    };

    const handleBook = async () => {
        if (!selectedSlot || !selectedTeam) return;
        const { name, phone, companions } = form;
        if (!name || !phone || companions <= 0) return alert('모든 정보를 입력해주세요');

        setBookingLoading(true);
        try {
            const res = await fetch('/api/reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeslotId: selectedSlot.id,
                    teamName: selectedTeam,
                    userName: name,
                    phone,
                    companions,
                }),
            });

            if (res.ok) {
                setShowPaymentInfo(true); // 예약 완료 후 입금 안내 표시
                fetchSlots();
            } else {
                const err = await res.json();
                alert(`예약 실패: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('예약 중 오류 발생');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-b from-purple-50 to-pink-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center text-purple-700 mb-8 animate-fade-in">🔮 오늘의 팝업 예약</h1>

            {loading && <p className="text-center text-gray-500">로딩 중...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading &&
                    slots.map((slot) => (
                        <div
                            key={slot.id}
                            className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border ${
                                slot.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <p className="font-bold text-xl text-gray-800 mb-4">
                                {new Date(slot.start_time).toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}{' '}
                                ~{' '}
                                {new Date(slot.end_time).toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(slot.teams).map(([team, capacity]) => (
                                    <button
                                        key={team}
                                        disabled={capacity <= 0 || slot.disabled}
                                        onClick={() => openModal(slot, team)}
                                        className={`px-5 py-2 rounded-xl font-semibold text-white shadow-md transition-all duration-200
                      ${
                          capacity <= 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : teamColors[team] || 'bg-indigo-500 hover:bg-indigo-600'
                      }`}
                                    >
                                        {team} {capacity > 0 ? `(${capacity}팀 남음)` : '(마감)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>

            {/* 예약 모달 */}
            {modalOpen && selectedSlot && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
                        {!showPaymentInfo ? (
                            <>
                                <h2 className="text-3xl font-bold mb-4 text-purple-700">{selectedTeam} 예약</h2>
                                <p className="text-gray-600 mb-5">
                                    시간:{' '}
                                    {new Date(selectedSlot.start_time).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}{' '}
                                    ~{' '}
                                    {new Date(selectedSlot.end_time).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>

                                <div className="space-y-4">
                                    {['이름', '연락처', '동행자 수'].map((label, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                {label}
                                            </label>
                                            <input
                                                type={label === '동행자 수' ? 'number' : 'text'}
                                                min={1}
                                                value={
                                                    label === '이름'
                                                        ? form.name
                                                        : label === '연락처'
                                                        ? form.phone
                                                        : form.companions
                                                }
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        [label === '이름'
                                                            ? 'name'
                                                            : label === '연락처'
                                                            ? 'phone'
                                                            : 'companions']:
                                                            label === '동행자 수'
                                                                ? Number(e.target.value)
                                                                : e.target.value,
                                                    }))
                                                }
                                                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none transition"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 font-semibold transition"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleBook}
                                        disabled={bookingLoading}
                                        className="px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-semibold transition"
                                    >
                                        {bookingLoading ? '예약 중...' : '예약하기'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            // 입금 안내 모달
                            <div className="mt-2">
                                <h3 className="font-bold text-xl mb-2 text-purple-700">💰 입금 안내</h3>
                                <p>아래 계좌로 입금 부탁드립니다.</p>
                                <p>🏦 은행: 신한</p>
                                <p>💳 계좌번호: 110-412-869073</p>
                                <p>👤 예금주: 곽채영</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    입금 확인 후 문자로 안내드립니다.
                                    <br />
                                    예약 취소는 예약 2일 전까지만 가능합니다.
                                </p>
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        setShowPaymentInfo(false);
                                    }}
                                    className="mt-3 px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-semibold"
                                >
                                    확인
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
