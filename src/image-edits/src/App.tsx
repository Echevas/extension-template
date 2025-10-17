import { useState, useEffect } from "react";
import { EchoProvider } from '@/contexts/echo';

function App() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        // Get the image URL from the query parameters
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get('imageUrl');
        
        if (urlParam) {
          setImageUrl(decodeURIComponent(urlParam));
        }
    }, []);

    if (!imageUrl) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-foreground">No image found</div>
          </div>
        );
      }

    return (
        <EchoProvider>
            <div className="flex flex-col items-center justify-center h-screen">
                {/* Pass the image into the app */}
                <h1 className="text-2xl font-bold">Image Editing Extension</h1>
            </div>
        </EchoProvider>
    );
}

export default App;