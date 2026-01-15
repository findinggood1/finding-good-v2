#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const emails = [
  'info@findinggood.com',
  'support@findinggood.com',
  'brian@brianfretwell.com',
  'bfretwell7@hotmail.com'
]

async function verify() {
  console.log('='.repeat(70))
  console.log('PRIORITY DATA (priorities)')
  console.log('='.repeat(70))

  const { data: priority } = await supabase
    .from('priorities')
    .select('client_email, type, integrity_line, ownership_signal, created_at')
    .in('client_email', emails)
    .order('client_email')
    .order('created_at', { ascending: false })

  let currentEmail = ''
  for (const p of priority || []) {
    if (p.client_email !== currentEmail) {
      console.log(`\n[${p.client_email}]`)
      currentEmail = p.client_email
    }
    const date = new Date(p.created_at).toLocaleDateString()
    const signal = (p.ownership_signal || '').padEnd(10)
    const line = (p.integrity_line || '').substring(0, 50)
    console.log(`  ${date} | ${signal} | ${line}...`)
  }

  console.log('\n' + '='.repeat(70))
  console.log('PROOF DATA (validations)')
  console.log('='.repeat(70))

  const { data: proof } = await supabase
    .from('validations')
    .select('client_email, mode, proof_line, validation_signal, scores, created_at')
    .in('client_email', emails)
    .order('client_email')
    .order('created_at', { ascending: false })

  currentEmail = ''
  for (const p of proof || []) {
    if (p.client_email !== currentEmail) {
      console.log(`\n[${p.client_email}]`)
      currentEmail = p.client_email
    }
    const date = new Date(p.created_at).toLocaleDateString()
    const signal = (p.validation_signal || '').padEnd(10)
    const scores = p.scores || {}
    const line = (p.proof_line || '').substring(0, 40)
    console.log(`  ${date} | ${signal} | C:${scores.confidence || 0} Cl:${scores.clarity || 0} O:${scores.ownership || 0} | ${line}...`)
  }

  console.log('\n' + '='.repeat(70))
  const priorityCount = priority?.length || 0
  const proofCount = proof?.length || 0
  console.log(`TOTALS: ${priorityCount} Priority entries, ${proofCount} Proof entries`)
  console.log('='.repeat(70))
}

verify().catch(console.error)
