import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
export function PressReleaseEditPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Create/Edit Press Release</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Press Release Details</CardTitle>
              <CardDescription>Fill in the main content for your press release.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Your amazing title" />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" placeholder="A short, catchy summary" />
              </div>
              <div>
                <Label>Body Content</Label>
                <div className="mt-2 rounded-md border border-input min-h-[200px] p-4 bg-background">
                  Rich Text Editor Placeholder
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Status & Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status controls will go here.</p>
              <Button className="w-full mt-4">Publish Now</Button>
              <Button variant="outline" className="w-full mt-2">Save as Draft</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input id="seo-title" />
              </div>
              <div>
                <Label htmlFor="seo-description">Meta Description</Label>
                <Textarea id="seo-description" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}