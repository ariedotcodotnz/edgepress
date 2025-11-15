import { useParams, Link } from 'react-router-dom';
import { MOCK_PRESS_RELEASES } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from '@/components/ui/sonner';
export function PressReleasePage() {
  const { slug } = useParams();
  const release = MOCK_PRESS_RELEASES.find((pr) => pr.slug === slug);
  if (!release) {
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
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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