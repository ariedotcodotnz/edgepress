export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-wider">
          About EdgePress
        </h1>
        <div className="mt-8 prose prose-lg max-w-none prose-headings:font-mono prose-headings:font-bold">
          <p>
            EdgePress is a demonstration of a modern, full-stack media centre built on Cloudflare's serverless platform. It combines a striking neo-brutalist public frontend with a clean, functional, and password-protected admin CMS.
          </p>
          <h2>Our Philosophy</h2>
          <p>
            We believe in the power of the edge. By building on Cloudflare Workers, Durable Objects, and the broader Cloudflare ecosystem, we can deliver applications that are incredibly fast, globally scalable, and secure by default. This project showcases that powerful, production-ready applications can be built without traditional servers.
          </p>
          <h3>Boilerplate Company Description</h3>
          <blockquote>
            EdgePress is the leading provider of next-generation, serverless content management solutions. Our mission is to empower creators and businesses to deliver content faster and more securely than ever before, leveraging the power of the global Cloudflare network.
          </blockquote>
        </div>
      </div>
    </div>
  );
}