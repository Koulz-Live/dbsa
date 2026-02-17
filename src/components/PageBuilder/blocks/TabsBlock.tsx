import React, { useMemo, useState } from "react";
import { TabsBlock } from "../types";

interface TabsBlockComponentProps {
  block: TabsBlock;
  isEditing?: boolean;
}

export const TabsBlockComponent: React.FC<TabsBlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const { title, tabs, fullWidth } = block.data;
  const firstTabId = useMemo(() => tabs[0]?.id, [tabs]);
  const [activeTabId, setActiveTabId] = useState(firstTabId);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab?.id);

  const handleSelect = (tabId: string) => {
    if (isEditing) return;
    const nextIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (nextIndex !== -1 && activeIndex !== -1) {
      setDirection(nextIndex > activeIndex ? "right" : "left");
    }
    setActiveTabId(tabId);
  };

  return (
    <section
      className={`py-5 ${isEditing ? "border border-2 border-primary" : ""}`}
    >
      <style>
        {`
          .tabs-pane {
            animation: tabsFade 220ms ease-in;
          }
          .tabs-pane-left {
            animation: tabsSlideLeft 260ms ease-in-out;
          }
          .tabs-pane-right {
            animation: tabsSlideRight 260ms ease-in-out;
          }
          @keyframes tabsFade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes tabsSlideLeft {
            from { opacity: 0; transform: translateX(-18px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes tabsSlideRight {
            from { opacity: 0; transform: translateX(18px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .tabs-icon {
            font-size: 0.95rem;
          }
        `}
      </style>
      <div className={fullWidth ? "container-fluid px-3 px-lg-4" : "container"}>
        {title && <h2 className="section-title mb-2">{title}</h2>}
      </div>
      <div className="brand-tabs" role="tablist" aria-label="Tabbed highlights">
        <div
          className={
            fullWidth
              ? "container-fluid px-3 px-lg-4 d-flex align-items-center"
              : "container d-flex align-items-center"
          }
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab?.id ? "active" : ""}
              aria-selected={tab.id === activeTab?.id}
              onClick={() => handleSelect(tab.id)}
            >
              {tab.icon && (
                <i
                  className={`bi bi-${tab.icon} me-2 tabs-icon`}
                  aria-hidden="true"
                ></i>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab && (
        <div
          className={`case-wrap ${fullWidth ? "" : "container"}`}
          key={activeTab.id}
        >
          <div
            className={fullWidth ? "container-fluid px-3 px-lg-4" : "container"}
          >
            <div className={`row g-0 tabs-pane tabs-pane-${direction}`}>
              <div className="col-12 col-lg-6">
                <div className="p-4 p-lg-5">
                  <div className="text-primary fw-bold mb-2">
                    {activeTab.title}
                  </div>
                  <p className="section-sub mb-3">{activeTab.description}</p>
                  {activeTab.stats && activeTab.stats.length > 0 && (
                    <div className="row case-kpis">
                      {activeTab.stats.map((stat) => (
                        <div key={stat.id} className="col-6">
                          <div className="kpi">
                            <div className="val">{stat.value}</div>
                            <div className="lbl">{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab.linkText && activeTab.linkUrl && (
                    <div className="mt-4">
                      <a
                        className="arrow-link"
                        href={activeTab.linkUrl}
                        onClick={(e) => isEditing && e.preventDefault()}
                      >
                        {activeTab.linkText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-lg-6 case-media">
                {activeTab.image ? (
                  <img alt={activeTab.label} src={activeTab.image} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    Add an image
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
