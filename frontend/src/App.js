import './App.css';
import Navbar from './Componenets/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your main content will go here */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your App</h1>
          <p className="text-gray-600">Start building your content here!</p>
        </div>
      </main>
    </div>
  );
}

export default App;
