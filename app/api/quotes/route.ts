import { NextResponse } from 'next/server';

const FALLBACK_QUOTE = [
    {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "inspiration"
    }
];

export async function GET() {
    // const API_KEY = process.env.API_NINJAS_KEY || '';

    try {
        // Using dummyjson as a reliable free alternative
        const response = await fetch('https://dummyjson.com/quotes/random', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Quote API responded with ${response.status}`);
        }

        const data = await response.json();

        // Adapt format to match previous API expectation (Array of { quote, author, category })
        const adaptedQuote = [{
            quote: data.quote,
            author: data.author,
            category: 'inspiration' // DummyJSON doesn't always provide category in random endpoint
        }];

        return NextResponse.json(adaptedQuote);
    } catch (error) {
        console.error('Quote API Route Error:', error);
        return NextResponse.json(FALLBACK_QUOTE);
    }
}
