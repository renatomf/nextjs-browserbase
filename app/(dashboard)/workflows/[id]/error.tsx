"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { RotateCw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          This workflow could not be loaded. Try again, or pick another workflow
          from the sidebar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => unstable_retry()}>
          <RotateCw />
          Try again
        </Button>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">
            {error.digest}
          </p>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
