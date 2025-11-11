import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
    const { timeslotId, kind } = await req.json();
    if (!timeslotId || !kind) return NextResponse.json({ error: 'timeslotId, kind 필수' }, { status: 400 });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 현재 잔여 팀 확인
        const slotRes = await client.query(
            `SELECT saju_capacity, tarot_capacity, disabled
       FROM timeslots WHERE id = $1 FOR UPDATE`,
            [timeslotId]
        );

        if (slotRes.rowCount === 0) throw new Error('타임이 존재하지 않습니다.');

        const slot = slotRes.rows[0];
        if (slot.disabled) throw new Error('이미 비활성화된 타임입니다.');

        if (kind === 'SAJU' && slot.saju_capacity <= 0) throw new Error('사주 예약이 꽉 찼습니다.');
        if (kind === 'TAROT' && slot.tarot_capacity <= 0) throw new Error('타로 예약이 꽉 찼습니다.');

        // 예약 삽입
        await client.query(`INSERT INTO reservations (timeslot_id, kind) VALUES ($1, $2)`, [timeslotId, kind]);

        // 잔여 자리 차감
        if (kind === 'SAJU') {
            await client.query(
                `UPDATE timeslots
         SET saju_capacity = saju_capacity - 1
         WHERE id = $1`,
                [timeslotId]
            );
        } else {
            await client.query(
                `UPDATE timeslots
         SET tarot_capacity = tarot_capacity - 1
         WHERE id = $1`,
                [timeslotId]
            );
        }

        // 둘 다 0이면 비활성화 처리
        await client.query(
            `UPDATE timeslots
       SET disabled = true
       WHERE id = $1 AND saju_capacity <= 0 AND tarot_capacity <= 0`,
            [timeslotId]
        );

        await client.query('COMMIT');
        return NextResponse.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 400 });
    } finally {
        client.release();
    }
}
