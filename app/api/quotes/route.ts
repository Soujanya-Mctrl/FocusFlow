import { NextResponse } from 'next/server';

export async function GET() {
    const API_KEY = process.env.API_NINJAS_KEY || '';

    try {
        const response = await fetch('https://api.api-ninjas.com/v2/randomquotes', {
            headers: {
                'X-Api-Key': API_KEY
            },
            next: { revalidate: 0 } // Ensure we get fresh quotes
        });

        if (!response.ok) {
            throw new Error(`API Ninjas responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Quote API Route Error:', error);
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
}
