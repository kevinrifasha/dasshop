import React, { Component } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./views/Register";
import Onboarding from "./views/Onboarding";
import ChooseVoucher from "./views/ChooseVoucher";

const PhotoResult = React.lazy(() => import("./views/PhotoResults"));

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={loading}>
        <Routes>
          <Route exact path="/" name="PhotoResult" element={<Register/>} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
