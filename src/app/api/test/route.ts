import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    console.log(req.headers);
    return NextResponse.json({ message: 'Hello from the route!' });
}
