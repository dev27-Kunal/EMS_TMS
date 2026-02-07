import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
