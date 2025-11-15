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
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { StaticPage } from "@shared/types"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
export function StaticPagesPage() {
  const { data: pages, isLoading, error } = useQuery<StaticPage[]>({
    queryKey: ['staticPages'],
    queryFn: () => api('/api/pages'),
  });
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Static Pages</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Static Pages</CardTitle>
          <CardDescription>Edit the content of your site's static pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-destructive">
                    Failed to load pages.
                  </TableCell>
                </TableRow>
              ) : pages?.map(page => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{format(new Date(page.updatedAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="icon" variant="outline">
                      <Link to={`/admin/media/pages/${page.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}