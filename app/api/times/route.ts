import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET: 모든 타임 슬롯 목록
export async function GET() {
    const res = await query('SELECT * FROM timeslots ORDER BY start_time ASC');
    return NextResponse.json(res.rows);
}

// POST: 관리자 타임 생성
export async function POST(req: Request) {
    const { start, end, sajuCapacity = 2, tarotCapacity = 2 } = await req.json();
    if (!start || !end) return NextResponse.json({ error: 'start, end 필수' }, { status: 400 });

    const result = await query(
        `INSERT INTO timeslots (start_time, end_time, saju_capacity, tarot_capacity)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [start, end, sajuCapacity, tarotCapacity]
    );
    return NextResponse.json(result.rows[0]);
}
