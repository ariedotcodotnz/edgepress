import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { StaticPage } from "@shared/types"
import { toast } from "sonner"
import TiptapEditor from "@/components/admin/TiptapEditor"
import { Skeleton } from "@/components/ui/skeleton"
const staticPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});
type StaticPageFormData = z.infer<typeof staticPageSchema>;
export function StaticPageEditPage() {
  const { id } = useParams<{ id: 'about' | 'contact' | 'assets' }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: page, isLoading } = useQuery<StaticPage>({
    queryKey: ['staticPage', id],
    queryFn: () => api(`/api/pages/${id}`),
    enabled: !!id,
  });
  const { control, register, handleSubmit, formState: { errors } } = useForm<StaticPageFormData>({
    resolver: zodResolver(staticPageSchema),
    values: page,
  });
  const mutation = useMutation({
    mutationFn: (data: StaticPageFormData) => {
      return api(`/api/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast.success(`Page updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['staticPages'] });
      queryClient.invalidateQueries({ queryKey: ['staticPage', id] });
      navigate('/admin/media/pages');
    },
    onError: (error) => {
      toast.error(`Failed to update page: ${error.message}`);
    }
  });
  const onSubmit = (data: StaticPageFormData) => {
    mutation.mutate(data);
  };
  if (isLoading) {
    return (
        <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Edit Page: <span className="capitalize">{id}</span></h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/media/pages')}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>Update the content for the <span className="font-semibold capitalize">{id}</span> page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Body Content</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <TiptapEditor content={field.value} onChange={field.onChange} />}
            />
            {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}