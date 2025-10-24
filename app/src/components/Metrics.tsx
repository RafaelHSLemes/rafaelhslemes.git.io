import { useEffect, useState } from 'react'
import { db } from '../lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Metrics() {
  const [openCount, setOpenCount] = useState<number>(0)
  const [perDay, setPerDay] = useState<{ day: string; count: number }[]>([])
  const [firstResponseAvgMin, setFirstResponseAvgMin] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      const { data: convs } = await db().from('conversations').select('id').eq('status', 'open')
      setOpenCount(convs?.length || 0)

      // messages per day (last 14d)
      const { data: msgs } = await db()
        .from('messages')
        .select('id,created_at')
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
      const grouped = new Map<string, number>()
      msgs?.forEach((m) => {
        const day = new Date(m.created_at as string).toISOString().slice(0, 10)
        grouped.set(day, (grouped.get(day) || 0) + 1)
      })
      const days = Array.from(grouped.entries()).map(([day, count]) => ({ day, count }))
      setPerDay(days)

      // avg first response time (naive query)
      const { data: convMsgs } = await db()
        .from('messages')
        .select('conversation_id, author, created_at')
        .order('created_at')
      const firsts = new Map<string, string>()
      const firstAdmin = new Map<string, string>()
      convMsgs?.forEach((m) => {
        const cid = m.conversation_id as string
        const ts = m.created_at as string
        if (!firsts.has(cid) && m.author === 'visitor') firsts.set(cid, ts)
        if (!firstAdmin.has(cid) && m.author === 'admin') firstAdmin.set(cid, ts)
      })
      let total = 0
      let count = 0
      firsts.forEach((vTs, cid) => {
        const aTs = firstAdmin.get(cid)
        if (aTs) {
          total += (new Date(aTs).getTime() - new Date(vTs).getTime()) / 60000
          count += 1
        }
      })
      setFirstResponseAvgMin(count ? Math.round(total / count) : 0)
    })()
  }, [])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded">
        <div className="text-sm opacity-70">Conversations abertas</div>
        <div className="text-2xl font-semibold">{openCount}</div>
      </div>
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded md:col-span-2">
        <div className="text-sm opacity-70 mb-2">Mensagens por dia (14d)</div>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={perDay}>
              <XAxis dataKey="day" hide={perDay.length > 10} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded md:col-span-3">
        <div className="text-sm opacity-70 mb-2">Tempo médio 1ª resposta (min)</div>
        <div className="text-2xl font-semibold">{firstResponseAvgMin}</div>
      </div>
    </div>
  )
}
