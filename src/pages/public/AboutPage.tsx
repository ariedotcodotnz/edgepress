import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { StaticPage } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
export function AboutPage() {
  const { data: page, isLoading, error } = useQuery<StaticPage>({
    queryKey: ['staticPage', 'about'],
    queryFn: () => api('/api/pages/about'),
  });
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Skeleton className="h-12 w-1/2 mb-8" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-4" />
      </div>
    );
  }
  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
          About EdgePress
        </h1>
        <p className="mt-8 text-lg text-destructive">Could not load page content.</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
          {page.title}
        </h1>
        <div 
          className="mt-8 prose prose-lg max-w-none prose-headings:font-mono prose-headings:font-bold"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}