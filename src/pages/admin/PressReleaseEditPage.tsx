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
import { CalendarIcon, Copy, Mail } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
const pressReleaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["Draft", "Published", "Scheduled"]),
  publishAt: z.date(),
});
type PressReleaseFormData = z.infer<typeof pressReleaseSchema>;
interface GeneratedEmail {
  subject: string;
  htmlBody: string;
  plainTextBody: string;
}
export function PressReleaseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
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
  const emailMutation = useMutation({
    mutationFn: () => api<GeneratedEmail>(`/api/press-releases/${id}/generate-email`),
    onSuccess: (data) => {
      setGeneratedEmail(data);
      toast.success("Email content generated!");
    },
    onError: (error) => toast.error(`Failed to generate email: ${error.message}`),
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
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${fieldName} copied to clipboard!`);
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
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="content">Content Editor</TabsTrigger>
          <TabsTrigger value="email" disabled={!isEditing}>Email Generation</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <div className="grid gap-4 md:grid-cols-[1fr_280px] lg:gap-8 mt-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
        </TabsContent>
        <TabsContent value="email">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Generate Email for Media</CardTitle>
              <CardDescription>Create a ready-to-send email for journalists based on this press release.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending} className="gap-2">
                <Mail className="h-4 w-4" />
                {emailMutation.isPending ? 'Generating...' : 'Generate Email Content'}
              </Button>
              {emailMutation.isPending && (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {generatedEmail && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <div className="relative">
                      <Input id="subject" readOnly value={generatedEmail.subject} className="pr-10" />
                      <Button type="button" size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7" onClick={() => copyToClipboard(generatedEmail.subject, 'Subject')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>HTML Body</Label>
                    <div className="relative">
                      <div className="h-48 overflow-y-auto rounded-md border p-4 prose prose-sm" dangerouslySetInnerHTML={{ __html: generatedEmail.htmlBody }} />
                      <Button type="button" size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(generatedEmail.htmlBody, 'HTML Body')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="plainText">Plain Text Body</Label>
                    <div className="relative">
                      <Textarea id="plainText" readOnly value={generatedEmail.plainTextBody} rows={10} className="pr-10" />
                      <Button type="button" size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(generatedEmail.plainTextBody, 'Plain Text Body')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}