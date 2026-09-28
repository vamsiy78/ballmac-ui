"use client"

import { Button, buttonVariants } from "@/components/ballmac/button"
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
import { Input } from "@/components/ballmac/input"
import { Label } from "@/components/ballmac/label"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>Edit profile</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update how your name appears to teammates. Changes save when you click Save.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input id="profile-name" defaultValue="Alex Morgan" autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-username">Username</Label>
              <Input id="profile-username" defaultValue="@alexm" autoComplete="username" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose type="button" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
