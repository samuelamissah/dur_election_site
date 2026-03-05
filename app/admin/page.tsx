
'use client';

import { uploadStaffCsv, getElectionStats, getStaffList, sendConfirmationEmail, deleteStaff, deleteAllStaff, deleteAllCandidates } from '../actions/admin';
import { uploadCandidatesCsv, getDetailedResults, deletePosition, getCandidatesList, deleteCandidate } from '../actions/admin_candidates';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Settings, BarChart2, Upload, Mail, Download, RefreshCw, AlertTriangleIcon, AlertTriangle, Landmark, LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('results');
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'staff':
        return <StaffManagement />;
      case 'candidates':
        return <CandidateManagement />;
      case 'control':
        return <ElectionControl />;
      case 'results':
        return <ResultsView />;
      default:
        return <ResultsView />;
    }
  };

  return (
    <div className="flex h-auto md:h-[calc(100vh-65px)] bg-zinc-50 dark:bg-zinc-950 font-sans antialiased overflow-x-hidden md:overflow-hidden flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800  flex-col hidden md:flex shadow-sm shrink-0">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Admin Console</h1>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Election Portal</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-4">Overview</p>
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
              activeTab === 'results' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <BarChart2 className={`w-5 h-5 mr-3 ${activeTab === 'results' ? 'text-white' : 'text-zinc-400'}`} />
            Live Results
          </button>
          
          <div className="h-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-4">Data Management</p>
          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
              activeTab === 'staff' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className={`w-5 h-5 mr-3 ${activeTab === 'staff' ? 'text-white' : 'text-zinc-400'}`} />
            Voter Registry
          </button>
          
          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
              activeTab === 'candidates' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <UserPlus className={`w-5 h-5 mr-3 ${activeTab === 'candidates' ? 'text-white' : 'text-zinc-400'}`} />
            Candidate List
          </button>
          
          <div className="h-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-4">Settings</p>
          <button
            onClick={() => setActiveTab('control')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
              activeTab === 'control' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Settings className={`w-5 h-5 mr-3 ${activeTab === 'control' ? 'text-white' : 'text-zinc-400'}`} />
            System Control
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 w-full">
        {/* Mobile Nav */}
        <div className="md:hidden mb-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Landmark className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Admin Console</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
             {[
               { id: 'results', label: 'Results', icon: BarChart2 },
               { id: 'staff', label: 'Voters', icon: Users },
               { id: 'candidates', label: 'Candidates', icon: UserPlus },
               { id: 'control', label: 'Control', icon: Settings }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                   activeTab === tab.id
                     ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                     : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700'
                 }`}
               >
                 <tab.icon className="w-3.5 h-3.5" />
                 {tab.label}
               </button>
             ))}
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl transition-colors font-bold text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

function ResultsView() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    votesCast: 0,
    turnout: '0%',
    lastUpdated: new Date()
  });
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(true); // Should fetch from DB/Config
  const [hydrated, setHydrated] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getElectionStats();
      if (data) {
        setStats({
          totalStaff: data.totalStaff,
          votesCast: data.votesCast,
          turnout: `${Math.round((data.votesCast / (data.totalStaff || 1)) * 100)}%`,
          lastUpdated: new Date()
        });
      }
      
      const details = await getDetailedResults();
      setDetailedResults(details || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);
  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Election Results</h2>
        <button 
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Staff" value={stats.totalStaff.toString()} />
        <StatCard title="Votes Cast" value={stats.votesCast.toString()} />
        <StatCard title="Turnout" value={stats.turnout} />
        <StatCard title="Time Remaining" value="4d 5h" />
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Live Results by Position</h3>
        <p className="text-xs text-zinc-400 mb-6" suppressHydrationWarning>Last updated: {hydrated ? stats.lastUpdated.toLocaleTimeString() : ''}</p>
        
        {isElectionActive && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md mb-6 flex items-start">
            <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Election is Active</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                These results are visible to Admins only. The public cannot see them until the election ends.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {detailedResults.map((position) => (
            <div key={position.id} className="border-b border-zinc-100 dark:border-zinc-700 pb-8 last:border-0 last:pb-0">
              <h4 className="text-md font-bold text-zinc-800 dark:text-zinc-200 mb-4 uppercase tracking-wide">
                {position.title}
              </h4>
              <div className="space-y-3">
                {position.candidates.map((candidate: any) => {
                  const totalVotesForPos = position.candidates.reduce((sum: number, c: any) => sum + (c.voteCount || 0), 0);
                  const percentage = totalVotesForPos > 0 ? Math.round(((candidate.voteCount || 0) / totalVotesForPos) * 100) : 0;
                  
                  return (
                    <div key={candidate.id} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{candidate.name}</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{candidate.voteCount || 0} votes ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {detailedResults.length === 0 && (
            <p className="text-center text-zinc-500 py-8">No results data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */

function StaffManagement() {
  const { show } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await getStaffList();
      setStaffList(data || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,staff_id,email\nSTF001,user1@example.com\nSTF002,user2@example.com";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessFile = async () => {
    if (!csvFile) return;
    
    setUploadStatus('Uploading...');
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      const result: any = await uploadStaffCsv(formData);
      
      if (result.success) {
        setUploadStatus(`Success! Uploaded ${result.count} staff records. Emails sent: ${result.emailsSent}.`);
        setCsvFile(null);
        show({ title: 'Upload Complete', message: `Uploaded ${result.count}. Emails sent: ${result.emailsSent}.`, variant: 'success' });
        fetchStaff(); // Refresh list
      } else {
        setUploadStatus(`Error: ${result.error}`);
        show({ title: 'Upload Failed', message: result.error, variant: 'error' });
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('An unexpected error occurred.');
      show({ title: 'Upload Failed', message: 'Unexpected error', variant: 'error' });
    }
  };

  const handleSendEmail = async (staffId: string) => {
    try {
      await sendConfirmationEmail(staffId);
      show({ title: 'Email Sent', message: `Notification sent to ${staffId}`, variant: 'success' });
    } catch (error) {
      console.error(error);
      show({ title: 'Email Failed', message: 'Failed to send email', variant: 'error' });
    }
  };
 
   const handleDeleteStaff = async (staffId: string) => {
     try {
       const result: any = await deleteStaff(staffId);
       if (result?.success) {
         fetchStaff();
        show({ title: 'Deleted', message: `Staff ${staffId} deleted`, variant: 'success' });
       } else {
        show({ title: 'Delete Failed', message: result?.error || 'Failed to delete staff', variant: 'error' });
       }
     } catch (error) {
       console.error(error);
      show({ title: 'Delete Failed', message: 'Failed to delete staff', variant: 'error' });
     }
   };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Manage Staff IDs</h2>
      
      {/* Upload Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-8 border border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Upload Staff Database</h3>
          <button 
            onClick={downloadTemplate}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download Template
          </button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Upload a CSV file containing columns: <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded">staff_id</code>, <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded">email</code>.
        </p>
        
        {uploadStatus && (
          <div className={`mb-4 p-3 rounded-md text-sm ${uploadStatus.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {uploadStatus}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex-1 w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-zinc-900 text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800 border-dashed border-2 border-zinc-300 dark:border-zinc-600 hover:border-blue-500 transition-colors">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-sm leading-normal text-zinc-600 dark:text-zinc-400">
              {csvFile ? csvFile.name : 'Select a file'}
            </span>
            <input type='file' className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={handleProcessFile}
            disabled={!csvFile}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              csvFile 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-700'
            }`}
          >
            Upload & Sync
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input 
            type="text" 
            placeholder="Search Staff ID or Email..." 
            className="w-full sm:w-auto px-4 py-2 border rounded-md dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button className="w-full sm:w-auto bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4" />
              Send Confirmations
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>

        {/* Delete All Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-xl font-bold">Confirm Mass Deletion</h3>
              </div>
              
              <div className="space-y-3 mb-8">
                <p className="text-zinc-700 dark:text-zinc-300">
                  You are about to delete <span className="font-bold">ALL staff records</span> and <span className="font-bold">ALL associated votes</span>.
                </p>
                <p className="text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                  <strong>Warning:</strong> This action is permanent and cannot be undone. All election progress will be lost.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowDeleteConfirm(false);
                    const res: any = await deleteAllStaff();
                    if (res?.success) {
                      show({ title: 'System Reset', message: 'All staff and votes have been cleared.', variant: 'success' });
                      fetchStaff();
                    } else {
                      show({ title: 'Action Failed', message: res?.error || 'Failed to delete all staff', variant: 'error' });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Yes, Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-3 font-medium text-zinc-500 dark:text-zinc-400">Staff ID</th>
                <th className="pb-3 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                <th className="pb-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="pb-3 font-medium text-zinc-500 dark:text-zinc-400">Email Sent</th>
                <th className="pb-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">Loading staff data...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No staff records found. Upload a CSV to get started.</td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id || staff.staff_id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 font-mono text-zinc-900 dark:text-zinc-200">{staff.staff_id}</td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">{staff.email}</td>
                    <td className="py-3">
                      {staff.has_voted ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Voted</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 text-sm">
                      {staff.email_sent ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">No</span>
                      )}
                    </td>
                    <td className="py-3">
                      {!staff.has_voted && (
                        <button 
                          onClick={() => handleSendEmail(staff.staff_id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                        >
                          Resend Email
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteStaff(staff.staff_id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  );
}

function CandidateManagement() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { show } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await getCandidatesList();
      setCandidatesList(data || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,position_slug,role,bio,image_url\nJohn Doe,chairman,Director,A leader...,https://example.com/pic.jpg";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidates_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessFile = async () => {
    if (!csvFile) return;
    
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      const result: any = await uploadCandidatesCsv(formData);
      if (result.success) {
        setUploadStatus(`Success! Uploaded ${result.count} candidates.`);
        setCsvFile(null);
        fetchCandidates(); // Refresh list
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('An unexpected error occurred.');
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const result: any = await deleteCandidate(candidateId);
      if (result?.success) {
        fetchCandidates();
        show({ title: 'Candidate Deleted', message: 'The candidate record has been removed.', variant: 'success' });
      } else {
        show({ title: 'Delete Failed', message: result?.error || 'Failed to delete candidate', variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      show({ title: 'Delete Failed', message: 'An unexpected error occurred.', variant: 'error' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Manage Candidates</h2>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-8 border border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Bulk Upload Candidates</h3>
          <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            <Download className="w-4 h-4 mr-1" /> Template
          </button>
        </div>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Upload CSV with columns: <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">name</code>, <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">position_slug</code> (e.g. 'chairman'), <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">role</code>, <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">bio</code>, <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">image_url</code>.
        </p>

        {uploadStatus && (
          <div className={`mb-4 p-3 rounded-md text-sm ${uploadStatus.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {uploadStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex-1 w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-zinc-900 text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800 border-dashed border-2 border-zinc-300 dark:border-zinc-600 hover:border-blue-500 transition-colors">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-sm leading-normal text-zinc-600 dark:text-zinc-400">
              {csvFile ? csvFile.name : 'Select a file'}
            </span>
            <input type='file' className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={handleProcessFile}
            disabled={!csvFile}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              csvFile ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-700'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Delete All Candidates Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Delete All Candidates?</h3>
            </div>
            
            <div className="space-y-3 mb-8">
              <p className="text-zinc-700 dark:text-zinc-300">
                This will remove <span className="font-bold">ALL candidates</span> from the database.
              </p>
              <p className="text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                <strong>Important:</strong> This will also clear any votes associated with these candidates to maintain database integrity.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
            onClick={async () => {
              setShowDeleteConfirm(false);
              const res: any = await deleteAllCandidates();
              if (res?.success) {
                show({ title: 'Candidates Cleared', message: 'All candidate records have been deleted.', variant: 'success' });
                fetchCandidates();
              } else {
                show({ title: 'Action Failed', message: res?.error || 'Failed to delete all candidates', variant: 'error' });
              }
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Candidates List Table */}
  <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
    <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Registered Candidates</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Candidate</th>
            <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Position</th>
            <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Role/Title</th>
            <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Loading candidates...</td>
            </tr>
          ) : candidatesList.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No candidates found. Upload a CSV to get started.</td>
            </tr>
          ) : (
            candidatesList.map((candidate) => (
              <tr key={candidate.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      {candidate.image_url ? (
                        <img 
                          src={candidate.image_url} 
                          alt={candidate.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                            (e.target as any).parentElement.innerText = candidate.name.charAt(0);
                          }}
                        />
                      ) : (
                        candidate.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{candidate.name}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[200px]">{candidate.bio || 'No bio provided'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600">
                    {candidate.positions?.title || candidate.position_id}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {candidate.role || '—'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
  );
}

function ElectionControl() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Election Control</h2>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 max-w-xl">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Election Status</h3>
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="font-medium text-green-800 dark:text-green-300">Active</span>
          </div>
          <span className="text-sm text-green-700 dark:text-green-400">Ends in 4 days</span>
        </div>
        
        <div className="space-y-4">
          <button className="w-full py-3 px-4 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors">
            Pause Election
          </button>
          <button className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">
            End Election Immediately
          </button>
          <button
            onClick={async () => {
              const res: any = await deletePosition('welfare')
              // Toast not available here; minimal feedback via alert to avoid dependency
              if (res?.success) {
                alert('Welfare position removed')
              } else {
                alert(res?.error || 'Failed to remove welfare position')
              }
            }}
            className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 font-medium transition-colors"
          >
            Remove Welfare Position
          </button>
        </div>
      </div>
    </div>
  );
}
