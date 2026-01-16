#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const testEmails = [
  'info@findinggood.com',
  'support@findinggood.com',
  'brian@brianfretwell.com',
  'bfretwell7@hotmail.com'
]

async function verify() {
  console.log('='.repeat(70))
  console.log('VERIFICATION: All Test Persona Data')
  console.log('='.repeat(70))

  // Clean up any debug data
  await supabase.from('predictions').delete().eq('client_email', 'test-debug@findinggood.com')
  await supabase.from('predictions').delete().eq('client_email', 'test@test.com')

  // PREDICTIONS
  console.log('\n--- PREDICTIONS TABLE ---')
  const { data: preds } = await supabase
    .from('predictions')
    .select('id, client_email, title, type, status, connection_count')
    .in('client_email', testEmails)
    .order('created_at')

  for (const p of preds || []) {
    console.log(`\n[${p.client_email}]`)
    console.log(`  ID: ${p.id}`)
    console.log(`  Title: ${p.title}`)
    console.log(`  Type: ${p.type} | Status: ${p.status} | Connections: ${p.connection_count}`)
  }

  // SNAPSHOTS
  console.log('\n--- SNAPSHOTS TABLE ---')
  const { data: snaps } = await supabase
    .from('snapshots')
    .select('id, client_email, prediction_id, predictability_score, zone_scores, growth_opportunity')
    .in('client_email', testEmails)

  for (const s of snaps || []) {
    const z = s.zone_scores || {}
    console.log(`\n[${s.client_email}]`)
    console.log(`  Score: ${s.predictability_score}%`)
    console.log(`  Zones: F=${(z.feelings || '?')[0]} I=${(z.influence || '?')[0]} R=${(z.resilience || '?')[0]} E=${(z.ethics || '?')[0]} S=${(z.strengths || '?')[0]}`)
    console.log(`  Growth: ${(s.growth_opportunity || '').substring(0, 60)}...`)
  }

  // CONNECTIONS
  console.log('\n--- PREDICTION_CONNECTIONS TABLE ---')
  const { data: conns } = await supabase
    .from('prediction_connections')
    .select('client_email, name, connection_time, relationship, involvement_type, how_involved')
    .in('client_email', testEmails)
    .order('client_email')
    .order('connection_time')

  let currentEmail = ''
  for (const c of conns || []) {
    if (c.client_email !== currentEmail) {
      console.log(`\n[${c.client_email}]`)
      currentEmail = c.client_email
    }
    const detail = c.relationship || c.involvement_type || (c.how_involved || '').substring(0, 35)
    console.log(`  ${c.connection_time.padEnd(6)} | ${c.name.padEnd(25)} | ${detail}`)
  }

  console.log('\n' + '='.repeat(70))
  console.log(`Total: ${preds?.length || 0} predictions, ${snaps?.length || 0} snapshots, ${conns?.length || 0} connections`)
  console.log('='.repeat(70))
}

verify().catch(console.error)
