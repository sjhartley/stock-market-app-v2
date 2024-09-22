import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App h-screen flex justify-center items-center">
          <button onClick={() => alert("hello world")} class="bg-orange-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Button
        </button>       
    </div>
  );
}

export default App;
