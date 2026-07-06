const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'log', label: 'Log' },
];

function Nav({ activeTab, onSelectTab }) {
  const tabs = TABS.map((tab) => {
    let className = 'nav-tab';
    if (tab.id === activeTab) {
      className = 'nav-tab nav-tab-active';
    }
    return (
      <button
        key={tab.id}
        type="button"
        className={className}
        onClick={() => onSelectTab(tab.id)}
      >
        {tab.label}
      </button>
    );
  });

  return <nav className="bottom-nav">{tabs}</nav>;
}

export default Nav;
