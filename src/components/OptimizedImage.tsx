import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Skip lazy loading for above-the-fold / current question images */
  priority?: boolean;
  /** Skeleton height while loading (defaults to 200px) */
  skeletonHeight?: string;
  /** Called when clicking the image */
  onImageClick?: (e: React.MouseEvent) => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  skeletonHeight = "200px",
  onImageClick,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);

    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (!src) return null;

  const handleLoad = () => setLoaded(true);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setErrored(true);
    if (onError) onError(e as React.SyntheticEvent<HTMLImageElement, Event>);
  };

  if (errored) return null;

  return (
    <div className="relative">
      {!loaded && (
        <Skeleton
          className="w-full rounded-lg"
          style={{ height: skeletonHeight }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0 absolute inset-0",
          className
        )}
        onClick={onImageClick}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
