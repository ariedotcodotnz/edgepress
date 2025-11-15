import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { PRContact } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});
type ContactFormData = z.infer<typeof contactSchema>;
export function ContactsEditPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<PRContact | null>(null);
  const { data: contacts, isLoading } = useQuery<PRContact[]>({
    queryKey: ['prContacts'],
    queryFn: () => api('/api/pr-contacts'),
  });
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: { formData: ContactFormData, id?: string }) => {
      return data.id
        ? api(`/api/pr-contacts/${data.id}`, { method: 'PUT', body: JSON.stringify(data.formData) })
        : api('/api/pr-contacts', { method: 'POST', body: JSON.stringify(data.formData) });
    },
    onSuccess: () => {
      toast.success(`Contact ${editingContact ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['prContacts'] });
      setDialogOpen(false);
      setEditingContact(null);
      reset({ name: '', title: '', email: '', phone: '' });
    },
    onError: (error) => toast.error(`Failed to save contact: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/pr-contacts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success("Contact deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['prContacts'] });
    },
    onError: (error) => toast.error(`Failed to delete contact: ${error.message}`),
  });
  const handleEdit = (contact: PRContact) => {
    setEditingContact(contact);
    setValue('name', contact.name);
    setValue('title', contact.title);
    setValue('email', contact.email);
    setValue('phone', contact.phone);
    setDialogOpen(true);
  };
  const handleAddNew = () => {
    setEditingContact(null);
    reset({ name: '', title: '', email: '', phone: '' });
    setDialogOpen(true);
  };
  const onSubmit = (data: ContactFormData) => {
    mutation.mutate({ formData: data, id: editingContact?.id });
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Contacts</h1>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Contact</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>PR Contacts</CardTitle>
          <CardDescription>Add, edit, and manage contacts for press releases.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : contacts?.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.title}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(contact.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit' : 'Create'} Contact</DialogTitle>
              <DialogDescription>Fill in the details for the PR contact.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" {...register('name')} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
              <div className="grid gap-2"><Label htmlFor="title">Title</Label><Input id="title" {...register('title')} />{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}</div>
              <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
              <div className="grid gap-2"><Label htmlFor="phone">Phone (Optional)</Label><Input id="phone" {...register('phone')} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Contact'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}