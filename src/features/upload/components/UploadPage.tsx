import { UploadDropzone } from './UploadDropzone'

export function UploadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Upload</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add video clips to your library (.mp4, .mov)
        </p>
      </div>
      <UploadDropzone />
    </main>
  )
}
