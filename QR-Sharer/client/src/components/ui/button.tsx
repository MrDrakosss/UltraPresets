type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export const Button = ({
  className = '',
  color = "bg-blue-600",
  variant = 'default',
  ...props
}: ButtonProps) => {
  const base = 'px-4 py-2 rounded font-medium cursor-pointer transition';

  const variants = {
    default: `${color} text-white hover:opacity-80`,
    outline: 'border border-white text-white bg-transparent hover:bg-white hover:text-black',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
