import { Button } from "@/components/ui/button"
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
import { MOCK_PRESS_RELEASES } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"
export function PressReleasesListPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Press Releases</h1>
        <Button asChild size="sm" className="gap-1">
          <Link to="/admin/media/press-releases/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              New Release
            </span>
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Press Releases</CardTitle>
          <CardDescription>Here you can create, edit, and manage all press releases.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PRESS_RELEASES.map(pr => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.title}</TableCell>
                  <TableCell>
                    <Badge variant={pr.status === 'Published' ? 'default' : 'secondary'}>{pr.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(pr.publishAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(pr.updatedAt), 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}