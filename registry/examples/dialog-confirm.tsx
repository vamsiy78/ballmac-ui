import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ballmac/dialog"

export default function DialogConfirm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            This permanently deletes the project, its 12 deployments and all environment variables. It can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete project</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
