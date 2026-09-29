import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@/components/ballmac/pagination"
export default function PaginationStates() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#page-1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-2" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
