import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from '@/components/ui/sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PressRelease } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
export function PressReleasePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { data: release, isLoading, error } = useQuery<PressRelease>({
    queryKey: ['pressRelease', slug, isPreview],
    queryFn: () => api(`/api/press-releases/slug/${slug}${isPreview ? '?preview=true' : ''}`),
    enabled: !!slug,
  });
  const trackViewMutation = useMutation({
    mutationFn: (pressReleaseId: string) =>
      api('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ type: 'pageview', pressReleaseId }),
      }),
    onError: (error) => console.error("Failed to track page view:", error),
  });
  const trackDownloadMutation = useMutation({
    mutationFn: (data: { pressReleaseId: string; assetId: string }) =>
      api('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ type: 'download', ...data }),
      }),
    onError: (error) => console.error("Failed to track download:", error),
  });
  useEffect(() => {
    if (release?.id && !isPreview) {
      trackViewMutation.mutate(release.id);
    }
  }, [release?.id, isPreview, trackViewMutation]);
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href.split('?')[0]);
    toast.success('Link copied to clipboard!');
  };
  const handleDownload = (assetId: string) => {
    if (release?.id && !isPreview) {
      trackDownloadMutation.mutate({ pressReleaseId: release.id, assetId });
    }
  };
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <Skeleton className="h-5 w-full mb-4" />
        <Skeleton className="h-5 w-full mb-4" />
        <Skeleton className="h-5 w-3/4 mb-4" />
      </div>
    );
  }
  if (error || !release) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl font-bold font-mono">404 - Not Found</h1>
        <p className="mt-4 text-lg">The press release you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Media Centre
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {isPreview && (
        <div className="bg-brutal-yellow text-foreground text-center p-2 font-mono font-bold">
          PREVIEW MODE
        </div>
      )}
      <Toaster />
      <div className="py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center font-mono uppercase text-sm hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all articles
        </Link>
        <article className="mt-8">
          <header>
            <div className="flex flex-wrap gap-2">
              {release.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-none border-foreground uppercase"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold font-mono leading-tight">
              {release.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80">
              {release.summary}
            </p>
            <p className="mt-6 font-mono text-sm text-foreground/70">
              Published on {format(new Date(release.publishAt), 'MMMM dd, yyyy')}
            </p>
          </header>
          <div className="mt-8 prose prose-lg max-w-none prose-headings:font-mono prose-headings:font-bold prose-a:text-foreground prose-a:underline hover:prose-a:text-brutal-yellow"
            dangerouslySetInnerHTML={{ __html: release.content }}
          />
          {release.attachments && release.attachments.length > 0 && (
            <div className="mt-12 border-t-2 border-foreground py-8">
              <h3 className="font-mono uppercase font-bold text-lg">Downloads</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {release.attachments.map(asset => (
                  <a key={asset.id} href={asset.url} download onClick={() => handleDownload(asset.id)} className="group flex items-center justify-between p-4 border-2 border-foreground hover:bg-brutal-yellow transition-colors">
                    <div>
                      <p className="font-bold">{asset.label}</p>
                      <p className="text-sm text-foreground/70">{asset.filename}</p>
                    </div>
                    <Download className="h-5 w-5 text-foreground/70 group-hover:text-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {release.contact?.name && (
            <div className="mt-12 border-t-2 border-b-2 border-foreground py-8">
              <h3 className="font-mono uppercase font-bold text-lg">Media Contact</h3>
              <div className="mt-4 space-y-1">
                <p>{release.contact.name}, {release.contact.title}</p>
                <p>
                  <a href={`mailto:${release.contact.email}`} className="hover:underline">{release.contact.email}</a>
                </p>
                {release.contact.phone && <p>{release.contact.phone}</p>}
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={copyLink}
              className="rounded-none bg-brutal-yellow text-foreground font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background active:translate-y-1 active:shadow-none shadow-hard-sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}