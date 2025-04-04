import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Inventory from './admin/Inventory';
import PendingRequest from './admin/PendingRequest';
import BorrowCatalog from './admin/BorrowCatalog';
import History from './admin/History';
import Profile from './Profile';
import AccountManagement from './superAdmin/AccountManagement';
import Requisition from './users/Requisition';
import RequestList from './users/RequestList';
import ActivityLog from './users/ActivityLog';
import SearchItems from './users/SearchItems';
import CapexRequest from './users/CapexRequest';
import ReturnItems from './users/ReturnItems';
import LayoutMain from './LayoutMain';

const AppController = () => {
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/pending-request" element={<PendingRequest />} />
                <Route path="/borrow-catalog" element={<BorrowCatalog />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/accounts" element={<AccountManagement />} />
                <Route path="/requisition" element={<Requisition />} />
                <Route path="/request-list" element={<RequestList />} />
                <Route path="/activity-log" element={<ActivityLog />} />
                <Route path="/search-items" element={<SearchItems />} />
                <Route path="/capex-request" element={<CapexRequest />} />
                <Route path="/return-items" element={<ReturnItems />} />
                <Route path="/main/*" element={<LayoutMain />} />
            </Routes>
        </BrowserRouter>
    )
}
 
export default AppController