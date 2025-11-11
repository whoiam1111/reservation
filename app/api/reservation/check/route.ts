import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');

    if (!name || !phone) {
        return NextResponse.json({ error: '이름과 휴대폰 번호를 입력해주세요.' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        const res = await client.query(
            `SELECT r.id, r.user_name, r.phone, r.companions, r.team_name,r.paid, t.start_time, t.end_time
             FROM reservations r
             JOIN timeslots t ON r.timeslot_id = t.id
             WHERE r.user_name = $1 AND r.phone = $2
             ORDER BY t.start_time`,
            [name, phone]
        );

        if (res.rowCount === 0) {
            return NextResponse.json({ reservations: [] });
        }

        return NextResponse.json({ reservations: res.rows });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
