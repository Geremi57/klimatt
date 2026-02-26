import { Route, Routes } from 'react-router-dom';
import { Home } from './routes/Home';
import MarketsPage from './routes/Markets';
import PestsPage from './routes/Pests';
import { CalendarPage } from './routes/Carlendar';
import DiaryPage from './routes/Diary';
import MarketplacePage from './routes/Marketplace';
import ProductDetailsPage from './routes/ProductDetails';
import { AiChatButton } from './components/chat';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="markets" element={<MarketsPage />} />
        <Route path="pests" element={<PestsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="marketplace/:productId" element={<ProductDetailsPage />} />
      </Routes>
      
      <AiChatButton />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            backgroundColor: 'oklch(1 0 0)',
            color: 'oklch(0.2 0.02 142.5)',
            borderColor: 'oklch(0.92 0.01 142.5)',
          },
        }}
      />
    </div>
  );
}

export default App;