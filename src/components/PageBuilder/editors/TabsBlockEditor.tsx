import React, { useState } from "react";
import { TabsBlock, TabItem, TabStat } from "../types";

interface TabsBlockEditorProps {
  block: TabsBlock;
  onChange: (block: TabsBlock) => void;
}

export const TabsBlockEditor: React.FC<TabsBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const updateData = (updates: Partial<TabsBlock["data"]>) => {
    onChange({
      ...block,
      data: { ...block.data, ...updates },
    });
  };

  const addTab = () => {
    const newTab: TabItem = {
      id: Date.now().toString(),
      label: "New Tab",
      title: "Tab headline",
      description: "Tab description",
      stats: [],
    };
    updateData({ tabs: [...block.data.tabs, newTab] });
  };

  const removeTab = (tabId: string) => {
    updateData({ tabs: block.data.tabs.filter((tab) => tab.id !== tabId) });
  };

  const moveTab = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const tabs = [...block.data.tabs];
    const fromIndex = tabs.findIndex((tab) => tab.id === fromId);
    const toIndex = tabs.findIndex((tab) => tab.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);
    updateData({ tabs });
  };

  const updateTab = (tabId: string, updates: Partial<TabItem>) => {
    updateData({
      tabs: block.data.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab,
      ),
    });
  };

  const addStat = (tabId: string) => {
    const newStat: TabStat = {
      id: Date.now().toString(),
      value: "",
      label: "",
    };
    updateTab(tabId, {
      stats: [
        ...(block.data.tabs.find((tab) => tab.id === tabId)?.stats || []),
        newStat,
      ],
    });
  };

  const updateStat = (
    tabId: string,
    statId: string,
    updates: Partial<TabStat>,
  ) => {
    const tab = block.data.tabs.find((t) => t.id === tabId);
    if (!tab) return;
    const stats = (tab.stats || []).map((stat) =>
      stat.id === statId ? { ...stat, ...updates } : stat,
    );
    updateTab(tabId, { stats });
  };

  const removeStat = (tabId: string, statId: string) => {
    const tab = block.data.tabs.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, {
      stats: (tab.stats || []).filter((s) => s.id !== statId),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={block.data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tabbed section title"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="tabs-full-width"
          type="checkbox"
          checked={block.data.fullWidth || false}
          onChange={(e) => updateData({ fullWidth: e.target.checked })}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="tabs-full-width" className="text-sm text-gray-700">
          Full width section
        </label>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Tabs</h4>
          <button
            type="button"
            onClick={addTab}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Tab
          </button>
        </div>

        <div className="space-y-4">
          {block.data.tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`border border-gray-200 rounded-md p-4 bg-gray-50 ${
                draggedTabId === tab.id ? "opacity-60" : ""
              }`}
              draggable
              onDragStart={() => setDraggedTabId(tab.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTabId) {
                  moveTab(draggedTabId, tab.id);
                  setDraggedTabId(null);
                }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="bi bi-grip-vertical text-gray-400"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Tab {index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTab(tab.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tab Label
                  </label>
                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) =>
                      updateTab(tab.id, { label: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Bootstrap Icon (optional)
                  </label>
                  <input
                    type="text"
                    value={tab.icon || ""}
                    onChange={(e) =>
                      updateTab(tab.id, { icon: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. bar-chart, globe, lightning"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Uses Bootstrap Icons (without the bi- prefix).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={tab.title}
                    onChange={(e) =>
                      updateTab(tab.id, { title: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={tab.description}
                    onChange={(e) =>
                      updateTab(tab.id, { description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={tab.image || ""}
                    onChange={(e) =>
                      updateTab(tab.id, { image: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Link Text (optional)
                  </label>
                  <input
                    type="text"
                    value={tab.linkText || ""}
                    onChange={(e) =>
                      updateTab(tab.id, { linkText: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Link URL (optional)
                  </label>
                  <input
                    type="text"
                    value={tab.linkUrl || ""}
                    onChange={(e) =>
                      updateTab(tab.id, { linkUrl: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Stats
                    </span>
                    <button
                      type="button"
                      onClick={() => addStat(tab.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Add Stat
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(tab.stats || []).map((stat) => (
                      <div key={stat.id} className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) =>
                            updateStat(tab.id, stat.id, {
                              value: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Value (e.g. 2×)"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) =>
                            updateStat(tab.id, stat.id, {
                              label: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Label"
                        />
                        <button
                          type="button"
                          onClick={() => removeStat(tab.id, stat.id)}
                          className="text-xs text-red-600 hover:text-red-700 text-start"
                        >
                          Remove stat
                        </button>
                      </div>
                    ))}
                    {(tab.stats || []).length === 0 && (
                      <p className="text-xs text-gray-500">
                        No stats added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
