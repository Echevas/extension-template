import { EchoProvider } from "@/contexts/echo";
import { WelcomePage } from "./welcome";
import "./App.css";

function App() {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <EchoProvider>
            <WelcomePage />
        </EchoProvider>
      </div>
    );
  }
  
  export default App;