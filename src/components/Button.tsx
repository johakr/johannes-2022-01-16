import "./Button.css";

type ButtonProps = {} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button {...props} className="Button">
      {children}
    </button>
  );
}
