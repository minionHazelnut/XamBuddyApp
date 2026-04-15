import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://klfekdsdosqpymxcikjw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZmVrZHNkb3NxcHlteGNpa2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ5MTUsImV4cCI6MjA5MTMwMDkxNX0.ap2leUCcVyjttpYUn-UmPSl2SO6jlQyt3AnFldC1eWw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
