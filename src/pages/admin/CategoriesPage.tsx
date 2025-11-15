import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MediaAssetCategory } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});
type CategoryFormData = z.infer<typeof categorySchema>;
export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MediaAssetCategory | null>(null);
  const { data: categories, isLoading } = useQuery<MediaAssetCategory[]>({
    queryKey: ['mediaAssetCategories'],
    queryFn: () => api('/api/media-asset-categories'),
  });
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });
  const mutation = useMutation({
    mutationFn: (data: { formData: CategoryFormData, id?: string }) => {
      return data.id
        ? api(`/api/media-asset-categories/${data.id}`, { method: 'PUT', body: JSON.stringify(data.formData) })
        : api('/api/media-asset-categories', { method: 'POST', body: JSON.stringify(data.formData) });
    },
    onSuccess: () => {
      toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['mediaAssetCategories'] });
      setDialogOpen(false);
      setEditingCategory(null);
      reset({ name: '' });
    },
    onError: (error) => toast.error(`Failed to save category: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/media-asset-categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['mediaAssetCategories'] });
    },
    onError: (error) => toast.error(`Failed to delete category: ${error.message}`),
  });
  const handleEdit = (category: MediaAssetCategory) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setDialogOpen(true);
  };
  const handleAddNew = () => {
    setEditingCategory(null);
    reset({ name: '' });
    setDialogOpen(true);
  };
  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate({ formData: data, id: editingCategory?.id });
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Categories</h1>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Category</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Media Asset Categories</CardTitle>
          <CardDescription>Add, edit, and manage categories for organizing media assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={2}><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : categories?.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(category.id)}><Trash2 className="h-4 w-4" /></Button>
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
              <DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle>
              <DialogDescription>Enter a name for the category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Category'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}