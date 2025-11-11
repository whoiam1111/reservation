'use client';
import React from 'react';
import BookingButton from './BookingButton';

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    saju_capacity: number;
    tarot_capacity: number;
    disabled: boolean;
}

interface Props {
    slot: TimeSlot;
    onBooked: () => void;
}

export default function TimeSlotCard({ slot, onBooked }: Props) {
    const start = new Date(slot.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
    const end = new Date(slot.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 12,
                background: slot.disabled ? '#fafafa' : 'white',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>
                    {start} ~ {end}
                </strong>
                {slot.disabled ? (
                    <span style={{ color: 'red' }}>마감</span>
                ) : (
                    <span>
                        남은 팀 — 사주 {slot.saju_capacity}, 타로 {slot.tarot_capacity}
                    </span>
                )}
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <BookingButton
                    timeslotId={slot.id}
                    kind="SAJU"
                    disabled={slot.disabled || slot.saju_capacity <= 0}
                    onBooked={onBooked}
                />
                <BookingButton
                    timeslotId={slot.id}
                    kind="TAROT"
                    disabled={slot.disabled || slot.tarot_capacity <= 0}
                    onBooked={onBooked}
                />
            </div>
        </div>
    );
}
