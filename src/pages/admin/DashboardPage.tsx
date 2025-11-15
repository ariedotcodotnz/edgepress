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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { AnalyticsSummary, PressReleaseWithViews } from "@shared/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
export function DashboardPage() {
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
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Press Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.total}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.published}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.drafts}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.viewsLast7Days}</div>}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Press Releases</CardTitle>
          <CardDescription>Your most viewed press releases.</CardDescription>
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
              ) : topReleases?.slice(0, 5).map(pr => (
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