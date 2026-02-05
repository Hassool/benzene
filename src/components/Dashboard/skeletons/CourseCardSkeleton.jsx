import Skeleton from "@/components/ui/Skeleton";

const CourseCardSkeleton = () => {
  return (
    <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl overflow-hidden border border-border dark:border-border-dark p-4 space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
