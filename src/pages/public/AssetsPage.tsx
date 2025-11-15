import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { StaticPage, MediaAsset } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
export function AssetsPage() {
  const { data: page, isLoading: isLoadingPage } = useQuery<StaticPage>({
    queryKey: ['staticPage', 'assets'],
    queryFn: () => api('/api/pages/assets'),
  });
  const { data: assets, isLoading: isLoadingAssets } = useQuery<MediaAsset[]>({
    queryKey: ['mediaAssets'],
    queryFn: () => api('/api/media-assets'),
  });
  const assetsByCategory = useMemo(() => {
    if (!assets) return {};
    return assets.reduce((acc, asset) => {
      const categoryName = asset.categoryName || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(asset);
      return acc;
    }, {} as Record<string, MediaAsset[]>);
  }, [assets]);
  const orderedCategories = useMemo(() => {
    if (!assets) return [];
    const categoryOrderMap = new Map<string, number>();
    assets.forEach(asset => {
        if (asset.categoryName && !categoryOrderMap.has(asset.categoryName)) {
            categoryOrderMap.set(asset.categoryName, categoryOrderMap.size);
        }
    });
    return Array.from(categoryOrderMap.keys());
  }, [assets]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        <div className="text-center">
          {isLoadingPage ? (
            <>
              <Skeleton className="h-12 w-1/2 mx-auto" />
              <Skeleton className="mt-4 h-6 w-3/4 mx-auto" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
                {page?.title || 'Media Assets'}
              </h1>
              {page?.content && (
                <div
                  className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              )}
            </>
          )}
        </div>
        <div className="mt-16 space-y-12">
          {isLoadingAssets ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            orderedCategories.map(categoryName => (
              <AssetSection key={categoryName} title={categoryName} assets={assetsByCategory[categoryName]} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
function AssetSection({ title, assets }: { title: string; assets: MediaAsset[] }) {
  if (!assets || assets.length === 0) return null;
  return (
    <section>
      <h2 className="text-3xl font-bold font-mono uppercase border-b-2 border-foreground pb-4">
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {assets.map(asset => (
          <div key={asset.id} className="border-2 border-foreground p-4 flex flex-col justify-between shadow-hard-sm">
            <div className="aspect-video bg-muted/50 flex items-center justify-center p-4">
              <img src={asset.url} alt={asset.label} className="max-h-full max-w-full object-contain" onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // prevent infinite loop
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                    const text = document.createElement('span');
                    text.className = 'text-muted-foreground font-mono text-sm';
                    text.textContent = 'Image Preview';
                    parent.appendChild(text);
                }
              }}/>
            </div>
            <div className="mt-4 flex-grow">
              <p className="font-bold">{asset.label}</p>
              <p className="text-sm text-foreground/70">{asset.filename}</p>
            </div>
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