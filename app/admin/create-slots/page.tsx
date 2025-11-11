'use client';
import React, { useState } from 'react';

export default function AdminPage() {
    const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [startTime, setStartTime] = useState('13:00');
    const [endTime, setEndTime] = useState('19:00');
    const [interval, setInterval] = useState(60); // 30 또는 60
    const [teams, setTeams] = useState([
        { name: '사주', capacity: 2 },
        { name: '타로', capacity: 2 },
    ]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // 00:00~23:30 30분 단위 리스트
    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const h = String(Math.floor(i / 2)).padStart(2, '0');
        const m = i % 2 === 0 ? '00' : '30';
        return `${h}:${m}`;
    });

    const addTeam = () => setTeams([...teams, { name: '', capacity: 1 }]);
    const updateTeam = (idx: number, field: string, value: string | number) => {
        const newTeams = [...teams];
        (newTeams[idx] as any)[field] = field === 'capacity' ? Number(value) : value;
        setTeams(newTeams);
    };
    const removeTeam = (idx: number) => setTeams(teams.filter((_, i) => i !== idx));

    async function createDaySlots() {
        setLoading(true);
        setMsg('');
        try {
            const baseDate = new Date(date);
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const requests: Promise<Response>[] = [];

            for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
                const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, minutes);
                const end = new Date(start.getTime() + interval * 60 * 1000);

                const teamCapacities: Record<string, number> = {};
                for (const t of teams) {
                    if (t.name.trim()) teamCapacities[t.name] = t.capacity;
                }

                requests.push(
                    fetch('/api/times', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            start: start.toISOString(),
                            end: end.toISOString(),
                            teams: teamCapacities,
                        }),
                    })
                );
            }

            await Promise.all(requests);
            setMsg(`✅ ${date} ${startTime}~${endTime} 슬롯 생성 완료!`);
        } catch (e) {
            console.error(e);
            setMsg('❌ 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 text-center">📅 관리자 예약 타임 설정</h1>

                {/* 날짜 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* 시간 + 간격 */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                        <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            {timeOptions.map((t) => (
                                <option
                                    key={t}
                                    value={t}
                                >
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            {timeOptions.map((t) => (
                                <option
                                    key={t}
                                    value={t}
                                >
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">간격(분)</label>
                        <select
                            value={interval}
                            onChange={(e) => setInterval(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={30}>30분</option>
                            <option value={60}>1시간</option>
                        </select>
                    </div>
                </div>

                {/* 팀 설정 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">팀 설정</h2>
                    <div className="space-y-2">
                        {teams.map((team, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="팀 이름 (예: 사주)"
                                    value={team.name}
                                    onChange={(e) => updateTeam(i, 'name', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="number"
                                    placeholder="팀 수"
                                    min="1"
                                    value={team.capacity}
                                    onChange={(e) => updateTeam(i, 'capacity', e.target.value)}
                                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={() => removeTeam(i)}
                                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={addTeam}
                        className="mt-3 text-indigo-600 font-medium hover:underline"
                    >
                        + 팀 추가
                    </button>
                </div>

                {/* 버튼 */}
                <button
                    onClick={createDaySlots}
                    disabled={loading}
                    className={`w-full text-white py-2.5 rounded-lg font-semibold transition 
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {loading ? '생성 중...' : `${date} 슬롯 생성`}
                </button>

                {msg && <p className="text-center text-gray-700 text-sm mt-3">{msg}</p>}
            </div>
        </main>
    );
}
