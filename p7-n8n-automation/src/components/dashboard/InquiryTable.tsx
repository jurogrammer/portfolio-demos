import { Inquiry } from '@/types/inquiry'
import { STATUS_COLORS, URGENCY_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  inquiries: Inquiry[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`
}

export function InquiryTable({ inquiries }: Props) {
  if (inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        접수된 문의가 없습니다.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>티켓ID</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>긴급도</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>접수일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.ticketId}>
              <TableCell className="font-mono text-xs">{inquiry.ticketId}</TableCell>
              <TableCell>{inquiry.name}</TableCell>
              <TableCell>{inquiry.aiCategory || inquiry.categoryInput}</TableCell>
              <TableCell>
                <span className={`text-sm font-medium ${URGENCY_COLORS[inquiry.aiUrgency]}`}>
                  {inquiry.aiUrgency}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[inquiry.status]}>{inquiry.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(inquiry.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
