import { Badge } from "@/components/ballmac/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ballmac/table";
const invoices = [
  { id: "INV-1042", customer: "Northwind Studio", status: "Paid", amount: 1250 },
  { id: "INV-1043", customer: "Bluebird Labs", status: "Pending", amount: 480 },
  { id: "INV-1044", customer: "Harbor & Co", status: "Paid", amount: 2310 },
  { id: "INV-1045", customer: "Kilo Systems", status: "Overdue", amount: 890 },
];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export default function TableDemo() {
  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  return (
    <div className="w-full max-w-lg">
      <Table label="Recent invoices" striped>
        <TableCaption>Invoices from the last 30 days</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-mono text-xs">{i.id}</TableCell>
              <TableCell className="font-medium">{i.customer}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  status={i.status === "Paid" ? "success" : i.status === "Pending" ? "warning" : "error"}
                  dot
                >
                  {i.status}
                </Badge>
              </TableCell>
              <TableCell numeric>{money.format(i.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell numeric>{money.format(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
