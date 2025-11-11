// app/api/admin/reservations/[id]/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params; // 여기서 await 필요
    const reservationId = Number(id);
    if (!reservationId) return NextResponse.json({ error: '유효하지 않은 ID' }, { status: 400 });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 예약 조회
        const resRes = await client.query(`SELECT * FROM reservations WHERE id = $1`, [reservationId]);
        if (resRes.rowCount === 0) throw new Error('예약을 찾을 수 없습니다.');

        const reservation = resRes.rows[0];
        const timeslotId = reservation.timeslot_id;
        const teamName = reservation.team_name;

        // timeslot teams 복원
        const slotRes = await client.query(`SELECT teams FROM timeslots WHERE id = $1 FOR UPDATE`, [timeslotId]);
        if (slotRes.rowCount === 0) throw new Error('타임슬롯을 찾을 수 없습니다.');

        const teams: Record<string, number> = slotRes.rows[0].teams;
        teams[teamName] = (teams[teamName] || 0) + 1;

        await client.query(`UPDATE timeslots SET teams = $1 WHERE id = $2`, [teams, timeslotId]);

        // 예약 삭제
        await client.query(`DELETE FROM reservations WHERE id = $1`, [reservationId]);

        await client.query('COMMIT');

        return NextResponse.json({ success: true });
    } catch (err: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 400 });
    } finally {
        client.release();
    }
}
