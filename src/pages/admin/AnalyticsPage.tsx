import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { AnalyticsSummary, PressReleaseWithViews } from "@shared/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
export function AnalyticsPage() {
  const { data: summary, isLoading: isLoadingSummary } = useQuery<AnalyticsSummary>({
    queryKey: ['analyticsSummary'],
    queryFn: () => api('/api/analytics/summary'),
  });
  const { data: topReleases, isLoading: isLoadingReleases } = useQuery<PressReleaseWithViews[]>({
    queryKey: ['topPressReleases'],
    queryFn: () => api('/api/analytics/press-releases'),
  });
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page Views (Last 30 Days)</CardTitle>
          <CardDescription>Total page views for all published press releases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {isLoadingSummary ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary?.viewsLast30DaysChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Press Releases</CardTitle>
          <CardDescription>All press releases sorted by total page views.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingReleases ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : topReleases?.map(pr => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">
                    <Link to={`/admin/media/press-releases/${pr.id}/edit`} className="hover:underline">
                      {pr.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pr.status === 'Published' ? 'default' : pr.status === 'Scheduled' ? 'outline' : 'secondary'}>{pr.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{pr.views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}