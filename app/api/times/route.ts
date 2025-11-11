import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET: 모든 타임 슬롯 목록
export async function GET() {
    const res = await query('SELECT * FROM timeslots ORDER BY start_time ASC');
    return NextResponse.json(res.rows);
}

// POST: 관리자 타임 생성 (동적으로 팀 구성)
export async function POST(req: Request) {
    try {
        const { start, end, teams } = await req.json();

        if (!start || !end || !teams) {
            return NextResponse.json({ error: 'start, end, teams 필수입니다.' }, { status: 400 });
        }

        // JSON 형태로 teams 저장 (예: {"사주":2,"타로":3})
        const result = await query(
            `INSERT INTO timeslots (start_time, end_time, teams)
       VALUES ($1, $2, $3::jsonb)
       RETURNING *`,
            [start, end, JSON.stringify(teams)]
        );

        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error('❌ POST /api/times 에러:', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
