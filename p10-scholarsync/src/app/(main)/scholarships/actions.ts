'use server'

import { createClient } from '@/lib/supabase/server'
import type { Scholarship } from '@/types/database'

export interface ScholarshipFilters {
  degree_type?: string
  region?: string
  org_type?: string
  keyword?: string
  gpa?: string
  income_quintile?: string
}

export async function searchScholarships(filters: ScholarshipFilters): Promise<Scholarship[]> {
  const supabase = await createClient()
  let query = supabase.from('ss_scholarships').select('*').eq('is_active', true)

  if (filters.degree_type) {
    query = query.or(`target_degree.cs.{${filters.degree_type}},target_degree.cs.{all}`)
  }

  if (filters.region) {
    query = query.or(`target_regions.is.null,target_regions.cs.{${filters.region}}`)
  }

  if (filters.org_type) {
    query = query.eq('org_type', filters.org_type)
  }

  if (filters.keyword) {
    const kw = filters.keyword.trim()
    query = query.or(`name.ilike.%${kw}%,organization.ilike.%${kw}%`)
  }

  if (filters.gpa) {
    const gpa = parseFloat(filters.gpa)
    if (!isNaN(gpa)) {
      query = query.or(`min_gpa.is.null,min_gpa.lte.${gpa}`)
    }
  }

  if (filters.income_quintile) {
    const iq = parseInt(filters.income_quintile)
    if (!isNaN(iq)) {
      query = query.or(`max_income_quintile.is.null,max_income_quintile.gte.${iq}`)
    }
  }

  const { data, error } = await query.order('deadline', { ascending: true })
  if (error) throw error
  return (data ?? []) as Scholarship[]
}
