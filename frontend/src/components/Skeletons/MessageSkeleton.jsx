const MessageSkeleton = () => {
  // Create an array of 12 items for skeleton messages to fill the space
  const skeletonMessages = Array(12).fill(null);

  return (
    <div className="space-y-6 h-full">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className={`flex items-start space-x-3 max-w-lg ${idx % 2 === 0 ? "flex-row" : "flex-row-reverse space-x-reverse"}`}>
            {/* Avatar */}
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></div>
            
            {/* Message bubble */}
            <div className="flex flex-col space-y-2">
              {/* Name skeleton */}
              <div className="h-3 bg-gray-300 rounded animate-pulse w-20"></div>
              
              {/* Message skeleton */}
              <div className={`p-4 rounded-lg min-h-[60px] flex items-center ${
                idx % 2 === 0 
                  ? "bg-gray-200 rounded-tl-none" 
                  : "bg-blue-400 rounded-tr-none"
              }`}>
                <div className="space-y-2 w-full">
                  <div className={`h-4 rounded animate-pulse ${
                    idx % 2 === 0 ? "bg-gray-300" : "bg-blue-300"
                  } ${idx % 3 === 0 ? "w-40" : idx % 3 === 1 ? "w-56" : "w-48"}`}></div>
                  {/* Sometimes show a second line */}
                  {idx % 3 === 0 && (
                    <div className={`h-4 rounded animate-pulse ${
                      idx % 2 === 0 ? "bg-gray-300" : "bg-blue-300"
                    } w-28`}></div>
                  )}
                </div>
              </div>
              
              {/* Time skeleton */}
              <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;