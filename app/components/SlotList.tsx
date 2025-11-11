'use client';
import React, { useEffect, useState } from 'react';
import TimeSlotCard from './TimeSlotCard';

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    saju_capacity: number;
    tarot_capacity: number;
    disabled: boolean;
}

export default function SlotList() {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSlots = async () => {
        setLoading(true);
        const res = await fetch('/api/times');
        const data = await res.json();
        setSlots(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {loading && <p>로딩 중...</p>}
            {!loading &&
                slots.map((slot) => (
                    <TimeSlotCard
                        key={slot.id}
                        slot={slot}
                        onBooked={fetchSlots}
                    />
                ))}
        </div>
    );
}
