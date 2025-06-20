import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddProject from "./pages/AddProject";
import ViewProject from "./pages/ViewProject";
import UpdateProject from "./pages//UpdateProject";
import SelectAdd from "./pages/SelectAdd";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<AddProject />} />
      <Route path="/select" element={<SelectAdd />} />
      <Route path="/view" element={<ViewProject />} />
      <Route path="/update" element={<UpdateProject />} />
    </Routes>
  );
}

export default App;
