import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { ContentItem, ContentStatus, Block } from "../../shared/types";
import { PageBuilder, PageBlock } from "../components/PageBuilder";

// Helper to convert database blocks to PageBlock format
const convertToPageBlocks = (blocks: Block[] | undefined): PageBlock[] => {
  if (!blocks) return [];
  return blocks.map((block, index) => ({
    ...block,
    order: index,
    type: block.type.toLowerCase() as any, // Convert "Hero" -> "hero", etc.
  })) as PageBlock[];
};

// Helper to convert PageBlocks back to database format
const convertFromPageBlocks = (blocks: PageBlock[]): Block[] => {
  return blocks.map((block) => ({
    id: block.id,
    type: (block.type.charAt(0).toUpperCase() + block.type.slice(1)) as any,
    data: block.data as Record<string, unknown>,
  }));
};

interface ContentFormData {
  title: string;
  slug: string;
  excerpt: string;
  content_type_id: string;
  department_id: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  hero_image_url: string;
  page_blocks: PageBlock[]; // Add page blocks
}

export function ContentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem | null>(null);

  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content_type_id: "",
    department_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: [],
    hero_image_url: "",
    page_blocks: [],
  });

  useEffect(() => {
    if (isEditMode) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ContentItem>(`/content/${id}`);
      setContent(response.data);

      // Populate form
      setFormData({
        title: response.data.title,
        slug: response.data.slug,
        excerpt: response.data.excerpt || "",
        content_type_id: response.data.content_type_id,
        department_id: response.data.department_id || "",
        meta_title: response.data.meta_title || "",
        meta_description: response.data.meta_description || "",
        meta_keywords: response.data.meta_keywords || [],
        hero_image_url: response.data.hero_image_url || "",
        page_blocks: convertToPageBlocks(response.data.page_data?.blocks),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Prepare payload with page_data
      const payload = {
        ...formData,
        page_data: {
          blocks: convertFromPageBlocks(formData.page_blocks),
        },
      };

      if (isEditMode) {
        await apiClient.patch(`/content/${id}`, payload);
        alert("Content updated successfully!");
      } else {
        const response = await apiClient.post<ContentItem>(
          "/content",
          payload,
        );
        alert("Content created successfully!");
        navigate(`/content/${response.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflowAction = async (action: string) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      await apiClient.post(`/workflow/${action}`, { content_id: id });
      alert(`Action "${action}" completed successfully!`);
      fetchContent(); // Refresh to get updated status
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  const getStatusBadgeClass = (status: ContentStatus) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";
    switch (status) {
      case "Draft":
        return `${baseClasses} bg-gray-200 text-gray-800`;
      case "InReview":
        return `${baseClasses} bg-blue-200 text-blue-800`;
      case "Approved":
        return `${baseClasses} bg-green-200 text-green-800`;
      case "Published":
        return `${baseClasses} bg-purple-200 text-purple-800`;
      case "Unpublished":
        return `${baseClasses} bg-orange-200 text-orange-800`;
      default:
        return baseClasses;
    }
  };

  const getStatusLabel = (status: ContentStatus) => {
    return status === "InReview" ? "In Review" : status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/content")}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Content List
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Content" : "Create New Content"}
            </h1>
            {content && (
              <div className="mt-2 flex items-center gap-3">
                <span className={getStatusBadgeClass(content.status)}>
                  {getStatusLabel(content.status)}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(content.updated_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter content title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="content-url-slug"
                      />
                      <button
                        type="button"
                        onClick={generateSlug}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      URL-friendly version of the title
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the content"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Type *
                      </label>
                      <select
                        value={formData.content_type_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content_type_id: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type...</option>
                        <option value="page">Page</option>
                        <option value="article">Article</option>
                        <option value="news">News</option>
                        <option value="event">Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department_id: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select department...</option>
                        <option value="dept1">Marketing</option>
                        <option value="dept2">Communications</option>
                        <option value="dept3">Operations</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO title (defaults to main title)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.hero_image_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero_image_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Page Builder */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Page Content</h2>
                <PageBuilder
                  blocks={formData.page_blocks}
                  onChange={(blocks) =>
                    setFormData({ ...formData, page_blocks: blocks })
                  }
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                      ? "Update Content"
                      : "Create Content"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/content")}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workflow Actions */}
            {content && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Workflow Actions</h3>
                <div className="space-y-2">
                  {content.status === "Draft" && (
                    <button
                      onClick={() => handleWorkflowAction("submit")}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Submit for Review
                    </button>
                  )}

                  {content.status === "InReview" && (
                    <>
                      <button
                        onClick={() => handleWorkflowAction("approve")}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve Content
                      </button>
                      <button
                        onClick={() => handleWorkflowAction("request-changes")}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        Request Changes
                      </button>
                    </>
                  )}

                  {content.status === "Approved" && (
                    <>
                      <button
                        onClick={() => handleWorkflowAction("publish")}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        Publish Now
                      </button>
                      <button
                        onClick={() => {
                          /* Schedule modal */
                        }}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Schedule Publishing
                      </button>
                    </>
                  )}

                  {content.status === "Published" && (
                    <button
                      onClick={() => handleWorkflowAction("unpublish")}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Unpublish Content
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <dl className="space-y-2 text-sm">
                {content && (
                  <>
                    <div>
                      <dt className="text-gray-500">Created</dt>
                      <dd className="font-medium">
                        {new Date(content.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Author</dt>
                      <dd className="font-medium">
                        {content.author_id.substring(0, 8)}...
                      </dd>
                    </div>
                    {content.publish_at && (
                      <div>
                        <dt className="text-gray-500">Scheduled Publish</dt>
                        <dd className="font-medium">
                          {new Date(content.publish_at).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>

            {/* Version History */}
            {content && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Version History</h3>
                <p className="text-sm text-gray-600 mb-3">
                  View and restore previous versions of this content.
                </p>
                <button
                  onClick={() => navigate(`/content/${id}/versions`)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  View History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
