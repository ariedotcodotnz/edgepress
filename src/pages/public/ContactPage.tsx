import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { StaticPage } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  outlet: z.string().min(1, "Outlet/Publication is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});
type ContactFormData = z.infer<typeof contactFormSchema>;
export function ContactPage() {
  const { data: page, isLoading, error } = useQuery<StaticPage>({
    queryKey: ['staticPage', 'contact'],
    queryFn: () => api('/api/pages/contact'),
  });
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: ContactFormData) => api('/api/contact-submissions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Your message has been sent!");
      reset();
    },
    onError: (error) => toast.error(`Submission failed: ${error.message}`),
  });
  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        {isLoading ? <Skeleton className="h-12 w-1/2 mx-auto" /> :
          <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider text-center">
            {page?.title || 'Contact Us'}
          </h1>
        }
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="border-2 border-foreground p-8 shadow-hard-md">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error || !page ? (
              <p className="text-destructive">Failed to load contact information.</p>
            ) : (
              <div
                className="prose prose-lg max-w-none prose-headings:font-mono prose-headings:font-bold"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="font-mono uppercase text-lg">Name</Label>
                <Input id="name" {...register('name')} className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="outlet" className="font-mono uppercase text-lg">Outlet/Publication</Label>
                <Input id="outlet" {...register('outlet')} className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
                {errors.outlet && <p className="text-sm text-destructive mt-1">{errors.outlet.message}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="font-mono uppercase text-lg">Email</Label>
                <Input id="email" type="email" {...register('email')} className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="message" className="font-mono uppercase text-lg">Message</Label>
                <Textarea id="message" rows={5} {...register('message')} className="mt-2 text-lg rounded-none border-2 border-foreground" />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="w-full h-12 rounded-none bg-brutal-yellow text-foreground font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background active:translate-y-1 active:shadow-none shadow-hard-sm"
              >
                {mutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}