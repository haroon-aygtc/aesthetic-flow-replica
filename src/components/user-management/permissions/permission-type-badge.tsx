
interface PermissionTypeBadgeProps {
  type: string;
}

export function PermissionTypeBadge({ type }: PermissionTypeBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${
      type === 'read' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
        : type === 'write' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }`}>
      {type}
    </span>
  );
}
