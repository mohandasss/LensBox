import './App.css';
import Navbar from './Components/Navbar';
import Caruselshapevideo from './Components/CarouselShapeVideo';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Caruselshapevideo />
      </main>
      
    </div>
  );
}

export default App;
