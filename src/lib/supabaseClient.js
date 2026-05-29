import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://artebanuzddpcfromctw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImFydGViYW51emRkcGNmcm9tY3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMjkyODAsImV4cCI6MjA5NTYwNTI4MH0.raGEusEfRUReSBmoxj9_T2DCR5U4rMOPZtlsa9oMtPU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
