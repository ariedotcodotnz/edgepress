import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContactSubmission } from "@shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
export function ContactSubmissionsPage() {
  const { data: submissions, isLoading, error } = useQuery<ContactSubmission[]>({
    queryKey: ['contactSubmissions'],
    queryFn: () => api('/api/contact-submissions'),
  });
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Contact Submissions</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Messages submitted through the public contact form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive">
                    Failed to load submissions.
                  </TableCell>
                </TableRow>
              ) : submissions?.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(sub.submittedAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{sub.outlet}</TableCell>
                  <TableCell className="max-w-xs truncate">{sub.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}