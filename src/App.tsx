import { useState } from "react";

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Hello Electron + Vite + React!!</p>
      <p>
        <input type="text" autoFocus />
        <button onClick={() => setCount((count) => count + 1)}>
          count is: {count}
        </button>
      </p>
      <p>
        Edit <code>App.tsx</code> and save to test HMR updates.
      </p>
    </div>
  );
};

export default App;
