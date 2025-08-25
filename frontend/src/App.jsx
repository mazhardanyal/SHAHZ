import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Distribution from "./pages/Distribution";
import NotFound from "./pages/NotFound";
import SalesInvoice from "./pages/SalesInvoice";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import ItemList from "./pages/ItemsList";
import CompanyInfo from "./pages/CompanyInfo";
import DistributionReport from "./pages/DistributionReport";
import RegionInfo from "./pages/RegionInfo";
import DamageClaim from "./pages/Damage";
import VanInfo from "./pages/VanInfo";
import AccountInfo from "./pages/AccountInfo";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

export default function App() {
  // check localStorage on first load
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem("loggedIn") === "true";
  });

  // update localStorage when login changes
  useEffect(() => {
    localStorage.setItem("loggedIn", loggedIn);
  }, [loggedIn]);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={<Login onLogin={() => setLoggedIn(true)} />}
        />

        {/* Protected Routes */}
        {loggedIn ? (
          <>
            <Route
              path="/"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/distribution"
              element={
                <DashboardLayout>
                  <Distribution />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/sales-invoice"
              element={
                <DashboardLayout>
                  <SalesInvoice />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/accountinfo"
              element={
                <DashboardLayout>
                  <AccountInfo />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/purchaseinvoice"
              element={
                <DashboardLayout>
                  <PurchaseInvoice />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/itemslist"
              element={
                <DashboardLayout>
                  <ItemList />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/companyinfo"
              element={
                <DashboardLayout>
                  <CompanyInfo />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/distributionreport"
              element={
                <DashboardLayout>
                  <DistributionReport />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/damage"
              element={
                <DashboardLayout>
                  <DamageClaim />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/region-info"
              element={
                <DashboardLayout>
                  <RegionInfo />
                </DashboardLayout>
              }
            />
            <Route
              path="/distribution/van-info"
              element={
                <DashboardLayout>
                  <VanInfo />
                </DashboardLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          // Redirect to login if not logged in
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}
