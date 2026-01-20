import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

export type MockupTableProps = React.ComponentPropsWithoutRef<'table'>;

export function MockupTable({
  className,
  children,
  ...props
}: MockupTableProps): React.JSX.Element {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn('w-full caption-bottom text-xs', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export type MockupTableHeaderProps = React.ComponentPropsWithoutRef<'thead'>;

export function MockupTableHeader({
  className,
  children,
  ...props
}: MockupTableHeaderProps): React.JSX.Element {
  return (
    <thead
      className={cn('[&_tr]:border-b', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export type MockupTableBodyProps = React.ComponentPropsWithoutRef<'tbody'>;

export function MockupTableBody({
  className,
  children,
  ...props
}: MockupTableBodyProps): React.JSX.Element {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export type MockupTableRowProps = React.ComponentPropsWithoutRef<'tr'>;

export function MockupTableRow({
  className,
  children,
  ...props
}: MockupTableRowProps): React.JSX.Element {
  return (
    <tr
      className={cn('border-b transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export type MockupTableHeadProps = React.ComponentPropsWithoutRef<'th'>;

export function MockupTableHead({
  className,
  children,
  ...props
}: MockupTableHeadProps): React.JSX.Element {
  return (
    <th
      className={cn(
        'h-8 px-3 text-left align-middle font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export type MockupTableCellProps = React.ComponentPropsWithoutRef<'td'>;

export function MockupTableCell({
  className,
  children,
  ...props
}: MockupTableCellProps): React.JSX.Element {
  return (
    <td
      className={cn('p-3 align-middle', className)}
      {...props}
    >
      {children}
    </td>
  );
}
