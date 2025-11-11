import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
    const { timeslotId, teamName, userName, phone, companions } = await req.json();

    if (!timeslotId || !teamName || !userName || !phone || !companions) {
        return NextResponse.json({ error: '모든 필드가 필요합니다' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 타임슬롯 조회 + 잠금
        const slotRes = await client.query(`SELECT teams FROM timeslots WHERE id = $1 FOR UPDATE`, [timeslotId]);

        if (slotRes.rowCount === 0) throw new Error('타임이 존재하지 않습니다.');

        const slot = slotRes.rows[0];
        const teams: Record<string, number> = slot.teams;

        // 팀 존재 여부 및 잔여 수 확인
        if (!teams[teamName]) throw new Error(`${teamName} 팀이 존재하지 않습니다.`);
        if (teams[teamName] <= 0) throw new Error(`${teamName} 예약이 꽉 찼습니다.`);

        // reservations에 삽입
        await client.query(
            `INSERT INTO reservations (timeslot_id, user_name, team_name, phone, companions)
             VALUES ($1, $2, $3, $4, $5)`,
            [timeslotId, userName, teamName, phone, companions]
        );

        // teams JSON 업데이트 (잔여 수 -1)
        teams[teamName] = teams[teamName] - 1;

        await client.query(
            `UPDATE timeslots
             SET teams = $1
             WHERE id = $2`,
            [teams, timeslotId]
        );

        await client.query('COMMIT');

        return NextResponse.json({ success: true, teams }); // 업데이트된 teams 반환
    } catch (err: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 400 });
    } finally {
        client.release();
    }
}
export async function GET() {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `SELECT r.id, r.user_name, r.phone, r.companions, r.team_name, r.timeslot_id, 
                    t.start_time, t.end_time
             FROM reservations r
             JOIN timeslots t ON r.timeslot_id = t.id
             ORDER BY t.start_time ASC, r.created_at ASC`
        );

        return NextResponse.json(res.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
