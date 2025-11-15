import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { PressReleaseAnalyticsData } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
interface PressReleaseAnalyticsProps {
  pressReleaseId: string;
}
export function PressReleaseAnalytics({ pressReleaseId }: PressReleaseAnalyticsProps) {
  const { data, isLoading, error } = useQuery<PressReleaseAnalyticsData>({
    queryKey: ['pressReleaseAnalytics', pressReleaseId],
    queryFn: () => api(`/api/analytics/press-release/${pressReleaseId}`),
    enabled: !!pressReleaseId,
  });
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }
  if (error) {
    return <p className="text-destructive mt-4">Failed to load analytics data.</p>;
  }
  if (!data) {
    return <p className="text-muted-foreground mt-4">No analytics data available.</p>;
  }
  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Total Views</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totalViews}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Views (Last 7 Days)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.viewsLast7Days}</p></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Attachment Downloads</CardTitle></CardHeader>
        <CardContent>
          {data.attachmentDownloads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attachment</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.attachmentDownloads.map(att => (
                  <TableRow key={att.assetId}>
                    <TableCell className="font-medium">{att.label}</TableCell>
                    <TableCell className="text-right">{att.downloads}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">This press release has no attachments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}