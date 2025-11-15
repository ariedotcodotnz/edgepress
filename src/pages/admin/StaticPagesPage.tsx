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
export function StaticPagesPage() {
  const pages = [
    { id: 'about', title: 'About Media Centre', lastUpdated: '2 days ago' },
    { id: 'contact', title: 'Media Contact Page', lastUpdated: '5 days ago' },
    { id: 'assets', title: 'Media Assets Page', lastUpdated: '1 week ago' },
  ]
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
              {pages.map(page => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="outline">
                      <Edit className="h-4 w-4" />
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