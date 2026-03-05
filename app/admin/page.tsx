
'use client';

import { uploadStaffCsv, getElectionStats, getStaffList, sendConfirmationEmail, deleteStaff } from '../actions/admin';
import { uploadCandidatesCsv, getDetailedResults } from '../actions/admin_candidates';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Settings, BarChart2, Upload, Mail, Download, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('results');
  const router = useRouter();

  useEffect(() => {
    // Check for admin session
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
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Election Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'results' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            Results & Turnout
          </button>
          
          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'staff' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Manage Staff IDs
          </button>
          
          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'candidates' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            <UserPlus className="w-5 h-5 mr-3" />
            Candidates
          </button>
          
          <button
            onClick={() => setActiveTab('control')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'control' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Election Control
          </button>
        </nav>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
              EC
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Admin User</p>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 w-full">
        {/* Mobile Nav Placeholder */}
        <div className="md:hidden mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Election Admin</h1>
          <div className="flex gap-2 overflow-x-auto pb-2">
             {['results', 'staff', 'candidates', 'control'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                   activeTab === tab
                     ? 'bg-blue-600 text-white'
                     : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                 }`}
               >
                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
               </button>
             ))}
          </div>
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
        <p className="text-xs text-zinc-400 mb-6">Last updated: {stats.lastUpdated.toLocaleTimeString()}</p>
        
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
                  const totalVotesForPos = position.candidates.reduce((sum: number, c: any) => sum + c.voteCount, 0);
                  const percentage = totalVotesForPos > 0 ? Math.round((candidate.voteCount / totalVotesForPos) * 100) : 0;
                  
                  return (
                    <div key={candidate.id} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{candidate.name}</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{candidate.voteCount} votes ({percentage}%)</span>
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
          <button className="w-full sm:w-auto bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            Send Confirmations
          </button>
        </div>
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
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('An unexpected error occurred.');
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
        </div>
      </div>
    </div>
  );
}
