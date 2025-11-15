import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MediaAsset, MediaAssetCategory } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, UploadCloud, File as FileIcon } from "lucide-react";
const assetSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
  categoryId: z.string().min(1, "Category is required"),
});
type AssetFormData = z.infer<typeof assetSchema>;
export function MediaAssetsEditPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { data: assets, isLoading } = useQuery<MediaAsset[]>({
    queryKey: ['mediaAssets'],
    queryFn: () => api('/api/media-assets'),
  });
  const { data: categories, isLoading: isLoadingCategories } = useQuery<MediaAssetCategory[]>({
    queryKey: ['mediaAssetCategories'],
    queryFn: () => api('/api/media-asset-categories'),
  });
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });
  const urlValue = watch('url');
  const createMutation = useMutation({
    mutationFn: (data: AssetFormData) => api('/api/media-assets', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Media asset created successfully!");
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
      setDialogOpen(false);
      reset();
      setFileName(null);
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
  const handleUrlPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = event.clipboardData.getData('text');
    try {
      const url = new URL(pastedUrl);
      const pathSegments = url.pathname.split('/');
      const lastSegment = pathSegments.pop() || 'file';
      setFileName(decodeURIComponent(lastSegment));
      setValue('url', pastedUrl, { shouldValidate: true });
    } catch (e) {
      // Not a valid URL, do nothing
    }
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
                  <TableCell className="capitalize">{asset.categoryName}</TableCell>
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { reset(); setFileName(null); } setDialogOpen(open); }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Media Asset</DialogTitle>
              <DialogDescription>Provide the details for the new asset.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" {...register('label')} />
                {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file-upload">File URL</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    {fileName ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileIcon className="w-8 h-8 mb-2 text-primary" />
                        <p className="font-semibold">{fileName}</p>
                        <p className="text-xs text-muted-foreground">{urlValue}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or paste URL</p>
                        <p className="text-xs text-muted-foreground">Provide a public URL to a file</p>
                      </div>
                    )}
                    <Input id="file-upload" className="hidden" {...register('url')} onPaste={handleUrlPaste} />
                  </label>
                </div>
                {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                      <SelectTrigger><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} /></SelectTrigger>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
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