# AI Rules & Project Guidelines - WNFitas

## Tech Stack
- **React 19**: Core frontend library using functional components and hooks.
- **TypeScript**: Strict typing for all data structures, especially for production calculations and order statuses.
- **Tailwind CSS**: Utility-first CSS framework for all styling and responsive design.
- **Lucide React**: Standard library for all iconography.
- **Recharts**: Used for production and financial data visualization on the dashboard.
- **Vite**: Build tool and development server.
- **Native Browser APIs**: Used for formatting (Intl.NumberFormat) and basic state persistence.

## Library Usage Rules
- **Icons**: Always use `lucide-react`. Do not install or use other icon libraries.
- **Charts**: Use `recharts` for any data visualization. Keep charts responsive using `ResponsiveContainer`.
- **Styling**: Use Tailwind CSS classes exclusively. Avoid writing custom CSS in `.css` files unless absolutely necessary for global resets.
- **Components**: Prioritize building small, reusable components in `src/components/`. Follow the Shadcn/UI patterns for accessibility and styling.
- **State Management**: Use React's built-in `useState` and `useContext` for state. Avoid heavy state management libraries like Redux unless the complexity significantly increases.
- **Calculations**: All industrial logic (meters, ink, time) must reside in `src/services/calculator.ts` to ensure consistency between the Orders and Production views.

## Development Standards
- **Language**: Code and comments in English; UI labels and user-facing strings in Portuguese (pt-BR).
- **Formatting**: Use `pt-BR` locale for currency (R$) and decimal separators (comma).
- **File Naming**: Use PascalCase for React components (e.g., `OrderCard.tsx`) and camelCase for utility/service files (e.g., `calculator.ts`).
- **Types**: Always export and use types from `src/types.ts`. Do not define local interfaces for shared data structures like `Order` or `Client`.
- **Responsiveness**: Every new UI element must be mobile-friendly using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).