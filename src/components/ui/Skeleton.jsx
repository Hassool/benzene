const Skeleton = ({ className, variant = "text", ...props }) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
  
  const variants = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "h-full w-full",
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant] || ""} ${className || ""}`}
      {...props}
    />
  );
};

export default Skeleton;
