import { NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@supabase/supabase-js';
import { createClient as createSsrClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const req = await request.json().catch(() => ({}));
    const confirmEmail: string | undefined = req.confirmEmail;

    const supabase = await createSsrClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
      return NextResponse.json({ error: 'Email confirmation does not match your account email.' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server not configured for account deletion.' }, { status: 500 });
    }

    const admin = createServerSupabase(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Best-effort delete user-related data (in case cascades are not present)
    const tablesToClean = [
      'notifications',
      'savings_goals',
      'budgets',
      'transactions',
      'account_sharing',
    ];

    for (const table of tablesToClean) {
      try {
        if (table === 'account_sharing') {
          await admin.from(table)
            .delete()
            .or(`primary_user_id.eq.${user.id},shared_user_id.eq.${user.id}`);
        } else {
          await admin.from(table).delete().eq('user_id', user.id);
        }
      } catch (ignoreCleanupError) {
        void ignoreCleanupError; // intentionally ignored
        // ignore and continue
      }
    }

    // Delete from public.users if present (auth trigger normally manages it)
    try { await admin.from('users').delete().eq('id', user.id); } catch {}

    // Finally delete the auth user
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


