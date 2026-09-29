import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ballmac/pagination"
export default function PaginationDemo() {
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-5 text-center shadow-sm">
      <p className="mb-4 text-sm text-muted-foreground">
        Showing 21–30 of 128 reports
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#page-2" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-3" isActive>
              3
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-4">4</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#page-4" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
