import { getUser } from '@netlify/identity'
import type { Config } from '@netlify/functions'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { database } from '../../db/index'
import { pledges, settings } from '../../db/schema'
import { defaults, type Campaign } from '../../src/lib/campaign'

export default async (req: Request) => {
  const respond = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  try {
    const db = database(),
      path = new URL(req.url).pathname
    if (
      req.method !== 'GET' &&
      req.headers.get('origin') !== new URL(req.url).origin
    )
      return respond({ error: 'Request not allowed.' }, 403)
    const admin = path.includes('/admin')
    if (admin) {
      const user = await getUser()
      if (!user?.roles?.includes('admin'))
        return respond({ error: 'Administrator access required.' }, 403)
    }
    const [stored] = await db.select().from(settings).where(eq(settings.id, 1))
    const content = (stored?.content || defaults) as Campaign
    if (req.method === 'GET') {
      const rows = await db
        .select({
          project: pledges.project,
          pledged: sql<number>`coalesce(sum(${pledges.amount}),0)::integer`,
          confirmed: sql<number>`coalesce(sum(case when ${pledges.status} = 'paid' then ${pledges.amount} else 0 end),0)::integer`,
        })
        .from(pledges)
        .where(sql`${pledges.status} <> 'cancelled'`)
        .groupBy(pledges.project)
      const windows = await db
        .select({ number: pledges.windowNumber, status: pledges.status })
        .from(pledges)
        .where(
          sql`${pledges.windowNumber} is not null and ${pledges.status} <> 'cancelled'`,
        )
      return respond({
        content,
        totals: Object.fromEntries(
          rows.map((r) => [
            r.project,
            { pledged: r.pledged, confirmed: r.confirmed },
          ]),
        ),
        windows,
        ...(admin
          ? {
              pledges: await db
                .select()
                .from(pledges)
                .orderBy(desc(pledges.createdAt)),
            }
          : {}),
      })
    }
    if (req.method === 'POST' && !admin) {
      const input = z
        .object({
          firstName: z.string().trim().min(1).max(100),
          lastName: z.string().trim().min(1).max(100),
          email: z.email().max(254),
          phone: z.string().trim().min(7).max(40),
          project: z.string(),
          windowNumber: z.number().int().min(1).max(36).nullable(),
          amount: z.number().int().positive().max(100000000),
          method: z.enum(['online', 'in-person']),
          message: z.string().max(2000).default(''),
          acknowledgement: z.literal(true),
          website: z.string().max(0).optional(),
        })
        .parse(await req.json())
      if (
        !content.projects.some((p) => p.id === input.project) ||
        (input.windowNumber !== null &&
          (input.project !== 'windows' ||
            input.amount !== content.windowAmount * 100))
      )
        return respond(
          { error: 'Please check the project and pledge amount.' },
          400,
        )
      const { acknowledgement, website, ...record } = input
      await db.insert(pledges).values({ ...record, status: 'reserved' })
      return respond({ saved: true }, 201)
    }
    if (req.method === 'PATCH' && admin) {
      const input = z
        .object({
          id: z.number().int(),
          status: z.enum(['pending', 'reserved', 'paid', 'cancelled']),
          notes: z.string().max(5000),
        })
        .parse(await req.json())
      await db
        .update(pledges)
        .set({ status: input.status, notes: input.notes })
        .where(eq(pledges.id, input.id))
      return respond({ saved: true })
    }
    if (req.method === 'PUT' && admin) {
      const input = z
        .object({
          heroTitle: z.string().min(1).max(150),
          heroDescription: z.string().min(1).max(1000),
          logo: z.string().startsWith('/img/'),
          heroImage: z.string().startsWith('/img/'),
          windowAmount: z.number().int().positive(),
          projects: z
            .array(
              z.object({
                id: z.enum([
                  'windows',
                  'stucco',
                  'roofing',
                  'painting',
                  'ac',
                  'electrical',
                ]),
                name: z.string().min(1),
                description: z.string(),
                goal: z.number().int().positive(),
                image: z.string().startsWith('/img/'),
              }),
            )
            .length(6),
        })
        .parse(await req.json())
      if (new Set(input.projects.map((p) => p.id)).size !== 6)
        return respond({ error: 'Each project must appear once.' }, 400)
      await db
        .insert(settings)
        .values({ id: 1, content: input })
        .onConflictDoUpdate({ target: settings.id, set: { content: input } })
      return respond({ saved: true })
    }
    return respond({ error: 'Method not allowed.' }, 405)
  } catch (error) {
    if (error instanceof z.ZodError)
      return respond(
        { error: 'Please check all required fields and enter a valid amount.' },
        400,
      )
    if (
      (error as { code?: string }).code === '23505' ||
      (error as { cause?: { code?: string } }).cause?.code === '23505'
    )
      return respond(
        {
          error:
            'This window has already been reserved. Please choose another window.',
        },
        409,
      )
    return respond(
      {
        error: 'We could not save or load this information. Please try again.',
      },
      503,
    )
  }
}
export const config: Config = { path: ['/api/campaign', '/api/admin/campaign'] }
