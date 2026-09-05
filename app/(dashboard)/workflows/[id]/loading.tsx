import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex w-full min-w-0 flex-1 items-center justify-center p-6">
      <Spinner className="text-muted-foreground size-6" />
    </div>
  )
}
