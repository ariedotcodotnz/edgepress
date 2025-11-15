import { MOCK_ASSETS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { StaticPage } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function AssetsPage() {
  const { data: page, isLoading, error } = useQuery<StaticPage>({
    queryKey: ['staticPage', 'assets'],
    queryFn: () => api('/api/pages/assets'),
  });
  const logos = MOCK_ASSETS.filter(a => a.category === 'logo');
  const productImages = MOCK_ASSETS.filter(a => a.category === 'product');
  const executivePhotos = MOCK_ASSETS.filter(a => a.category === 'executive');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        <div className="text-center">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-1/2 mx-auto" />
              <Skeleton className="mt-4 h-6 w-3/4 mx-auto" />
            </>
          ) : error || !page ? (
            <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
              Media Assets
            </h1>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
                {page.title}
              </h1>
              <div
                className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </>
          )}
        </div>
        <div className="mt-16 space-y-12">
          <AssetSection title="Logos" assets={logos} />
          <AssetSection title="Product Images" assets={productImages} />
          <AssetSection title="Executive Photos" assets={executivePhotos} />
        </div>
      </div>
    </div>
  );
}
function AssetSection({ title, assets }: { title: string; assets: typeof MOCK_ASSETS }) {
  if (assets.length === 0) return null;
  return (
    <section>
      <h2 className="text-3xl font-bold font-mono uppercase border-b-2 border-foreground pb-4">
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {assets.map(asset => (
          <div key={asset.id} className="border-2 border-foreground p-4 flex flex-col justify-between shadow-hard-sm">
            <div className="aspect-video bg-muted/50 flex items-center justify-center text-muted-foreground font-mono mb-4">
              Image Preview
            </div>
            <p className="font-bold">{asset.label}</p>
            <p className="text-sm text-foreground/70">{asset.filename}</p>
            <Button
              asChild
              className="mt-4 w-full rounded-none bg-foreground text-background font-bold uppercase tracking-wider border-2 border-foreground hover:bg-brutal-yellow hover:text-foreground"
            >
              <a href={asset.url} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}