import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps { icon: ReactNode; title: string; description: string; action?: ReactNode; }

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action}
    </div>
  );
}
