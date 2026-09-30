'use server'

import { getAvailability } from '@/lib/getAvailability'

// Called from the booking page (in the browser) to get free times for a service + date
export async function fetchSlots(serviceSlug: string, date: string) {
  return getAvailability(serviceSlug, date)
}