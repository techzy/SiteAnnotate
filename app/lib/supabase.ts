import {createClient} from '@supabase/supabase-js'

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supbabasePublishKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseURL, supbabasePublishKey)