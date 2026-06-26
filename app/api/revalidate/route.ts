import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Home and portfolio sections
  revalidatePath('/', 'layout');

  // Blog listing + all individual post pages (layout covers /blogs/*)
  revalidatePath('/blogs', 'layout');

  // Other pages
  revalidatePath('/about', 'page');
  revalidatePath('/contact', 'page');
  revalidatePath('/projects', 'page');
  revalidatePath('/experience', 'layout');

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

// Also accept POST (for GitHub webhook payload)
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  revalidatePath('/blogs', 'layout');
  revalidatePath('/about', 'page');
  revalidatePath('/contact', 'page');
  revalidatePath('/projects', 'page');
  revalidatePath('/experience', 'layout');

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
