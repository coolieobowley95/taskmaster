import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import moment from 'moment';

export default function WeeklyChart({ tasks }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = moment().subtract(6 - i, 'days');
    return {
      day: date.format('ddd'),
      date: date.format('YYYY-MM-DD'),
      completed: 0,
      created: 0,
    };
  });

  tasks.forEach((task) => {
    const createdDay = moment(task.created_date).format('YYYY-MM-DD');
    const dayEntry = last7Days.find((d) => d.date === createdDay);
    if (dayEntry) {
      if (task.status === 'done') dayEntry.completed++;
      dayEntry.created++;
    }
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={last7Days} barGap={4}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Completed" />
        <Bar dataKey="created" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} name="Created" />
      </BarChart>
    </ResponsiveContainer>
  );
}