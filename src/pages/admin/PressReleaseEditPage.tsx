import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type { PressRelease } from "@shared/types"
import { toast } from "sonner"
import TiptapEditor from "@/components/admin/TiptapEditor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
const pressReleaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["Draft", "Published", "Scheduled"]),
  publishAt: z.date(),
});
type PressReleaseFormData = z.infer<typeof pressReleaseSchema>;
export function PressReleaseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const { data: release, isLoading } = useQuery<PressRelease>({
    queryKey: ['pressRelease', id],
    queryFn: () => api(`/api/press-releases/${id}`),
    enabled: isEditing,
  });
  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PressReleaseFormData>({
    resolver: zodResolver(pressReleaseSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      status: 'Draft',
      publishAt: new Date(),
    },
    values: release ? {
      ...release,
      publishAt: new Date(release.publishAt),
    } : undefined,
  });
  const mutation = useMutation({
    mutationFn: (data: PressReleaseFormData) => {
      const payload = { ...data, publishAt: data.publishAt.toISOString() };
      return isEditing ? api(`/api/press-releases/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) : api('/api/press-releases', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      toast.success(`Press release ${isEditing ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['pressReleases'] });
      navigate('/admin/media/press-releases');
    },
    onError: (error) => {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} press release: ${error.message}`);
    }
  });
  const onSubmit = (data: PressReleaseFormData) => {
    mutation.mutate(data);
  };
  const title = watch('title');
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setValue('slug', slug, { shouldValidate: true });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">{isEditing ? 'Edit' : 'Create'} Press Release</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/media/press-releases')}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Release'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_280px] lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Press Release Details</CardTitle>
              <CardDescription>Fill in the main content for your press release.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input id="slug" {...register('slug')} />
                  <Button type="button" variant="outline" onClick={generateSlug}>Generate</Button>
                </div>
                {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" {...register('summary')} />
                {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>}
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
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Status & Publishing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Publish Date</Label>
                <Controller
                  name="publishAt"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}