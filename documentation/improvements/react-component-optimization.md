# React Component Optimization and Standardization

This document outlines various improvements that can be made to the React components in the codebase. These suggestions focus on reducing duplication, improving component composition, and enhancing maintainability. Each suggestion includes what needs to be done, why it matters, how to implement it, and actionable tasks.

## 1. Create a Unified Header Component System

### What?

Create a standardized, composable header component system that can be used across different entity types (Individual, Family, Place, etc.).

### Why?

Currently, there are separate header components with similar structures but different implementations:

- `src/components/individual/IndividualHeader.tsx`
- `src/components/family/FamilyHeader.tsx`
- `src/components/place/PlaceHeader.tsx`

These components share similar layouts, styling, and functionality, but are implemented independently, leading to code duplication and inconsistent user experience.

### How?

Create a composable header system with a base `EntityHeader` component that can be configured for different entity types through composition.

### Actionable Tasks

1. Create a new component: `src/components/common/EntityHeader.tsx`:

   ```tsx
   import { Avatar, AvatarFallback } from "@/components/ui/avatar";
   import { Badge } from "@/components/ui/badge";
   import { Button } from "@/components/ui/button";
   import { Card, CardHeader, CardTitle } from "@/components/ui/card";
   import { Pencil } from "lucide-react";
   import { ReactNode } from "react";

   interface EntityHeaderProps {
     title: string;
     initials?: string;
     badge?: string;
     actions?: ReactNode;
     metadata?: ReactNode;
     additionalContent?: ReactNode;
   }

   export function EntityHeader({
     title,
     initials = "?",
     badge,
     actions,
     metadata,
     additionalContent,
   }: EntityHeaderProps) {
     return (
       <Card>
         <CardHeader>
           <div className="flex items-start gap-4">
             <Avatar className="h-20 w-20">
               <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
             </Avatar>
             <div className="flex-1">
               <div className="flex items-center justify-between">
                 <CardTitle className="text-2xl">{title}</CardTitle>
                 {actions || (
                   <Button variant="outline" size="sm">
                     <Pencil className="h-4 w-4 mr-1" />
                     Edit
                   </Button>
                 )}
               </div>
               {badge && (
                 <div className="mt-1">
                   <Badge variant="secondary">{badge}</Badge>
                 </div>
               )}
               {metadata && (
                 <div className="mt-4 space-y-2 text-sm">{metadata}</div>
               )}
               {additionalContent && (
                 <div className="mt-4">{additionalContent}</div>
               )}
             </div>
           </div>
         </CardHeader>
       </Card>
     );
   }
   ```

2. Refactor `IndividualHeader` to use the new component:

   ```tsx
   import { GenderIcon } from "@/components/GenderIcon";
   import { EntityHeader } from "@/components/common/EntityHeader";
   import displayName from "@/utils/displayName";
   import { CalendarDays } from "lucide-react";

   // Keep the types the same as current

   export function IndividualHeader({
     individual,
   }: {
     individual: IndividualWithRelations;
   }) {
     const name = displayName(individual.names);
     const initials = individual.names
       .map((n) => n?.first_name?.[0] || "")
       .join("");

     const childrenCount = individual.families_as_spouse.reduce(
       (acc, family) => acc + family.children.length,
       0,
     );

     const metadata = (
       <>
         <div className="flex items-center gap-2 text-muted-foreground">
           <GenderIcon gender={individual.gender} />
           <span>{individual.gender}</span>
         </div>
         {individual.family_as_child[0]?.family && (
           <div className="flex items-center gap-2 text-muted-foreground">
             <CalendarDays className="h-4 w-4" />
             <span>{childrenCount} children</span>
           </div>
         )}
       </>
     );

     return (
       <EntityHeader title={name} initials={initials} metadata={metadata} />
     );
   }
   ```

3. Similarly refactor `FamilyHeader` and `PlaceHeader`.

## 2. Create a Unified Table Component System

### What?

Create a standardized approach for entity tables that share similar patterns.

### Why?

There are multiple table components with similar structures but different implementations:

- `src/components/individual/FamiliesAsSpouseTable.tsx`
- `src/components/individual/FamilyTable.tsx`

This causes code duplication and inconsistent UI across tables.

### How?

Create a more composable table system with higher-level components for common patterns.

### Actionable Tasks

1. Create a component: `src/components/common/EntityTable.tsx`:

   ```tsx
   import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
   } from "@/components/ui/table";
   import { ReactNode } from "react";

   export interface EntityTableProps<T> {
     data: T[];
     columns: {
       header: string;
       width?: string;
       cell: (item: T) => ReactNode;
     }[];
     keyExtractor: (item: T) => string;
     actions?: ReactNode;
     emptyState?: ReactNode;
   }

   export function EntityTable<T>({
     data,
     columns,
     keyExtractor,
     actions,
     emptyState,
   }: EntityTableProps<T>) {
     if (data.length === 0 && emptyState) {
       return <>{emptyState}</>;
     }

     return (
       <Table>
         <TableHeader>
           <TableRow>
             {columns.map((column, index) => (
               <TableHead
                 key={`header-${index}`}
                 className={column.width ? `w-[${column.width}]` : undefined}
               >
                 {column.header}
               </TableHead>
             ))}
             {actions && <TableHead className="w-[100px]"></TableHead>}
           </TableRow>
         </TableHeader>
         <TableBody>
           {data.map((item) => (
             <TableRow key={keyExtractor(item)}>
               {columns.map((column, colIndex) => (
                 <TableCell key={`cell-${keyExtractor(item)}-${colIndex}`}>
                   {column.cell(item)}
                 </TableCell>
               ))}
               {actions && <TableCell>{actions}</TableCell>}
             </TableRow>
           ))}
         </TableBody>
       </Table>
     );
   }
   ```

2. Refactor the existing tables to use this component.

## 3. Extract Duplicated `capitalize` Function

### What?

Extract the `capitalize` function that appears in multiple component files.

### Why?

The `capitalize` function is duplicated in:

- `src/components/place/PlaceHeader.tsx`
- Other files as identified in the function-duplication-and-utility-extraction.md document

### How?

Implement the string utility module as described in the previous improvement document.

### Actionable Tasks

1. Follow the instructions in the function-duplication-and-utility-extraction.md document to create the strings utility.

## 4. Create a Unified Card Container Component

### What?

Create a standardized card container component for consistent section styling.

### Why?

Many components use the Card component with similar styling patterns across the application. Standardizing this would improve consistency and reduce duplication.

### How?

Create a section container component that provides consistent styling for different content sections.

### Actionable Tasks

1. Create a component: `src/components/common/SectionCard.tsx`:

   ```tsx
   import {
     Card,
     CardContent,
     CardHeader,
     CardTitle,
   } from "@/components/ui/card";
   import { Button } from "@/components/ui/button";
   import { ReactNode } from "react";
   import { cn } from "@/lib/utils";

   interface SectionCardProps {
     title: string;
     children: ReactNode;
     action?: {
       label: string;
       icon?: ReactNode;
       onClick: () => void;
     };
     className?: string;
     contentClassName?: string;
   }

   export function SectionCard({
     title,
     children,
     action,
     className,
     contentClassName,
   }: SectionCardProps) {
     return (
       <Card className={cn("mt-6", className)}>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>{title}</CardTitle>
           {action && (
             <Button variant="outline" size="sm" onClick={action.onClick}>
               {action.icon}
               {action.label}
             </Button>
           )}
         </CardHeader>
         <CardContent className={contentClassName}>{children}</CardContent>
       </Card>
     );
   }
   ```

2. Update components to use this standardized card container.

## Conclusion

Implementing these React component improvements will enhance code maintainability, reduce duplication, and provide a more consistent user experience across the application. These tasks are suitable for developers looking to improve the component architecture of the application.

By creating more composable and reusable components, the codebase will become more maintainable, and new features will be easier to implement with consistent styling and behavior.
