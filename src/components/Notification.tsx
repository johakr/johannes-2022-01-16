import "./Notification.css";

type NotificationProps = {} & React.HTMLAttributes<HTMLDivElement>;

export default function Notification({
  children,
  ...props
}: NotificationProps) {
  return (
    <div {...props} className="Notification">
      {children}
    </div>
  );
}
