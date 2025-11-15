import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PressRelease } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
function PressReleaseCardSkeleton() {
  return (
    <div className="block border-2 border-foreground bg-background p-6 shadow-hard-sm">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-8 w-full" />
      <Skeleton className="mt-2 h-6 w-3/4" />
      <Skeleton className="mt-4 h-16 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
export function HomePage() {
  const { data: releases, isLoading, error } = useQuery<PressRelease[]>({
    queryKey: ['publishedPressReleases'],
    queryFn: () => api('/api/press-releases?status=Published'),
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24 lg:py-32">
        <div className="text-center border-2 border-foreground p-8 md:p-12 shadow-hard-md">
          <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
            Media Centre
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Welcome to the official source for news, announcements, and media assets from EdgePress.
          </p>
        </div>
        <div className="mt-16 md:mt-24">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              type="search"
              placeholder="Search articles..."
              className="h-12 text-lg rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-brutal-yellow"
            />
            <Button
              size="lg"
              className="h-12 rounded-none bg-foreground text-background font-bold uppercase tracking-wider border-2 border-foreground hover:bg-brutal-yellow hover:text-foreground active:translate-y-1 active:shadow-none shadow-hard-sm"
            >
              Search
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PressReleaseCardSkeleton key={i} />)
            ) : error ? (
              <p className="col-span-full text-center text-destructive">Failed to load articles.</p>
            ) : (
              releases?.map((release) => (
                <Link
                  to={`/press/${release.slug}`}
                  key={release.id}
                  className="group block border-2 border-foreground bg-background p-6 shadow-hard-sm hover:shadow-hard-md hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex flex-col h-full">
                    <p className="font-mono text-sm text-foreground/70">
                      {format(new Date(release.publishAt), 'MMMM dd, yyyy')}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold font-mono group-hover:underline">
                      {release.title}
                    </h3>
                    <p className="mt-3 text-base text-foreground/80 flex-grow">
                      {release.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
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
                    <div className="mt-6 flex items-center justify-end font-bold font-mono uppercase text-sm group-hover:text-brutal-yellow">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}