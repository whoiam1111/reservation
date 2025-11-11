'use client';
import React from 'react';

interface BookingButtonProps {
    timeslotId: number;
    kind: 'SAJU' | 'TAROT';
    disabled?: boolean;
    onBooked?: () => void;
}

export default function BookingButton({ timeslotId, kind, disabled, onBooked }: BookingButtonProps) {
    const handleBook = async () => {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeslotId, kind }),
        });
        const json = await res.json();

        if (res.ok) {
            alert('예약 완료!');
            onBooked?.();
        } else {
            alert(json.error || '예약 실패');
        }
    };

    return (
        <button
            onClick={handleBook}
            disabled={disabled}
            style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #aaa',
                background: disabled ? '#eee' : '#f5f5ff',
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {kind === 'SAJU' ? '사주 예약' : '타로 예약'}
        </button>
    );
}
