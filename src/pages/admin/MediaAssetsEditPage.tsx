import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MediaAsset } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2 } from "lucide-react";
const assetSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
  category: z.enum(["logo", "product", "executive", "other"]),
});
type AssetFormData = z.infer<typeof assetSchema>;
export function MediaAssetsEditPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { data: assets, isLoading } = useQuery<MediaAsset[]>({
    queryKey: ['mediaAssets'],
    queryFn: () => api('/api/media-assets'),
  });
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { category: 'other' },
  });
  const createMutation = useMutation({
    mutationFn: (data: AssetFormData) => api('/api/media-assets', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Media asset created successfully!");
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
      setDialogOpen(false);
      reset();
    },
    onError: (error) => toast.error(`Failed to create asset: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/media-assets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success("Media asset deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
    },
    onError: (error) => toast.error(`Failed to delete asset: ${error.message}`),
  });
  const onSubmit = (data: AssetFormData) => {
    createMutation.mutate(data);
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Media Assets</h1>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Asset</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>Add and manage downloadable assets for your media pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                ))
              ) : assets?.map(asset => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.label}</TableCell>
                  <TableCell className="capitalize">{asset.category}</TableCell>
                  <TableCell>{asset.filename}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(asset.id)}><Trash2 className="h-4 w-4" /></Button>
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
              <DialogTitle>Add New Media Asset</DialogTitle>
              <DialogDescription>Provide the details for the new asset.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="label">Label</Label><Input id="label" {...register('label')} />{errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}</div>
              <div className="grid gap-2"><Label htmlFor="url">URL</Label><Input id="url" {...register('url')} placeholder="https://..." />{errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}</div>
              <div className="grid gap-2"><Label>Category</Label>
                <z.Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logo">Logo</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Asset'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}