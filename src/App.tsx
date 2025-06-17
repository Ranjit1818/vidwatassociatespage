import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddProject from "./pages/AddProject";
import ViewProject from "./pages/ViewProject";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<AddProject />} />
      <Route path="/view" element={<ViewProject />} />
    </Routes>
  );
}

export default App;
