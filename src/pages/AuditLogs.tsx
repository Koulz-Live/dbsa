import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";
import { AuditLog } from "../../shared/types";

interface AuditLogsFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogsFilters>({});
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  });
  const [exporting, setExporting] = useState(false);

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: meta.per_page.toString(),
        ...Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
          },
          {} as Record<string, string>,
        ),
      });

      const response = await apiClient.get(`/api/audit?${params}`);
      setLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load audit logs";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Export logs
  const exportLogs = async (format: "csv" | "json") => {
    setExporting(true);

    try {
      const params = new URLSearchParams({
        format,
        ...Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
          },
          {} as Record<string, string>,
        ),
      });

      const response = await apiClient.get(`/api/audit/export?${params}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit_logs_${new Date().toISOString().split("T")[0]}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to export logs";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    fetchLogs(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
    setTimeout(() => fetchLogs(1), 0);
  };

  // Format action for display
  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format resource type for display
  const formatResourceType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get action badge color
  const getActionColor = (action: string): string => {
    if (action.includes("create")) return "bg-green-100 text-green-800";
    if (action.includes("update")) return "bg-blue-100 text-blue-800";
    if (action.includes("delete")) return "bg-red-100 text-red-800";
    if (action.includes("publish")) return "bg-purple-100 text-purple-800";
    if (action.includes("approve")) return "bg-emerald-100 text-emerald-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and export system audit trail for compliance and debugging
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={filters.user_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, user_id: e.target.value })
                }
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={filters.action || ""}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="create_content">Create Content</option>
                <option value="update_content">Update Content</option>
                <option value="delete_content">Delete Content</option>
                <option value="publish_content">Publish Content</option>
                <option value="unpublish_content">Unpublish Content</option>
                <option value="approve_content">Approve Content</option>
                <option value="upload_media">Upload Media</option>
                <option value="delete_media">Delete Media</option>
                <option value="assign_role">Assign Role</option>
                <option value="remove_role">Remove Role</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                value={filters.resource_type || ""}
                onChange={(e) =>
                  setFilters({ ...filters, resource_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="content_items">Content Items</option>
                <option value="media_assets">Media Assets</option>
                <option value="user_roles">User Roles</option>
                <option value="workflow_instances">Workflow Instances</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Export</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportLogs("csv")}
              disabled={exporting || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={() => exportLogs("json")}
              disabled={exporting || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? "Exporting..." : "Export JSON"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        ) : (
          <>
            {/* Audit Logs Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Audit Trail ({meta.total} entries)
                </h2>
              </div>

              {logs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No audit logs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="font-mono text-xs">
                              {log.user_id.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                                log.action,
                              )}`}
                            >
                              {formatAction(log.action)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div>{formatResourceType(log.resource_type)}</div>
                            <div className="font-mono text-xs text-gray-400">
                              {log.resource_id.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {log.ip_address || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {log.changes ? (
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:text-blue-800">
                                  View changes
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-w-md">
                                  {JSON.stringify(log.changes, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-gray-400">No details</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {meta.total_pages > 1 && (
              <div className="bg-white shadow rounded-lg p-4 mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {meta.page} of {meta.total_pages} ({meta.total}{" "}
                  total entries)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchLogs(meta.page + 1)}
                    disabled={meta.page === meta.total_pages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
