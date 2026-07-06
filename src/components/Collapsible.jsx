import { useState } from 'react';

function Collapsible({ summary, summaryClassName, children, containerClassName, panelClassName }) {
  const [isOpen, setIsOpen] = useState(false);

  let panelWrapperClass = 'collapsible-panel';
  if (isOpen) {
    panelWrapperClass = 'collapsible-panel collapsible-panel-open';
  }

  let innerClass = 'collapsible-inner';
  if (panelClassName) {
    innerClass = `collapsible-inner ${panelClassName}`;
  }

  return (
    <div className={containerClassName}>
      <button
        type="button"
        className={summaryClassName}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {summary}
      </button>
      <div className={panelWrapperClass}>
        <div className={innerClass}>{children}</div>
      </div>
    </div>
  );
}

export default Collapsible;
