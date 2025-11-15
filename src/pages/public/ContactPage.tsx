import { MOCK_CONTACT } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
export function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider text-center">
          Contact Us
        </h1>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="border-2 border-foreground p-8 shadow-hard-md">
            <h2 className="text-2xl font-bold font-mono uppercase">Media Inquiries</h2>
            <p className="mt-4 text-lg">For all media-related questions, please contact:</p>
            <div className="mt-6 space-y-2 border-t-2 border-foreground pt-6">
              <p className="text-xl font-bold">{MOCK_CONTACT.name}</p>
              <p className="text-md">{MOCK_CONTACT.title}</p>
              <p className="text-md">
                <a href={`mailto:${MOCK_CONTACT.email}`} className="underline hover:text-brutal-yellow">{MOCK_CONTACT.email}</a>
              </p>
              {MOCK_CONTACT.phone && <p className="text-md">{MOCK_CONTACT.phone}</p>}
            </div>
          </div>
          <div>
            <form className="space-y-6">
              <div>
                <Label htmlFor="name" className="font-mono uppercase text-lg">Name</Label>
                <Input id="name" className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
              </div>
              <div>
                <Label htmlFor="outlet" className="font-mono uppercase text-lg">Outlet/Publication</Label>
                <Input id="outlet" className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
              </div>
              <div>
                <Label htmlFor="email" className="font-mono uppercase text-lg">Email</Label>
                <Input id="email" type="email" className="mt-2 h-12 text-lg rounded-none border-2 border-foreground" />
              </div>
              <div>
                <Label htmlFor="message" className="font-mono uppercase text-lg">Message</Label>
                <Textarea id="message" rows={5} className="mt-2 text-lg rounded-none border-2 border-foreground" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-none bg-brutal-yellow text-foreground font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background active:translate-y-1 active:shadow-none shadow-hard-sm"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}