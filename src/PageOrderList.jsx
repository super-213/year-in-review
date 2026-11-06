import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import { PAGE_LABELS } from './pages.js';
import { translate } from './i18n.js';

const verticalOnly = ({ transform }) => ({ ...transform, x: 0 });

function SortablePage({ page, index, count, selected, dragging, reducedMotion, onSelect, onMove, onRemove, tr }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    disabled: count < 2,
    animateLayoutChanges: () => !reducedMotion,
    transition: reducedMotion ? null : { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' },
  });
  return <li ref={setNodeRef} data-page-id={page.id} className={`page-order-row ${selected ? 'page-order-selected' : ''} ${isDragging ? 'page-order-dragging' : ''}`}
    style={{ transform: CSS.Transform.toString(transform), transition }}>
    <button ref={setActivatorNodeRef} type="button" className="page-order-handle" {...attributes} {...listeners} disabled={count < 2}
      aria-label={tr('拖动第 {n} 页调整顺序', { n: index + 1 })} aria-roledescription={tr('可排序页面')} title={tr('拖动调整顺序')}><GripVertical size={18} /></button>
    <button type="button" onClick={() => onSelect(index)} aria-current={selected ? 'page' : undefined} className="page-order-select">
      <span className="page-order-number">{index + 1}.</span> {tr(PAGE_LABELS[page.type])}
    </button>
    <div className="page-order-actions">
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0 || dragging} aria-label={tr('上移第 {n} 页', { n: index + 1 })}><ArrowUp size={17} /></button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === count - 1 || dragging} aria-label={tr('下移第 {n} 页', { n: index + 1 })}><ArrowDown size={17} /></button>
      <button type="button" onClick={() => onRemove(index)} disabled={count === 1 || dragging} className="page-order-delete" aria-label={tr('删除第 {n} 页', { n: index + 1 })} title={count === 1 ? tr('至少保留一页') : tr('删除页面')}><Trash2 size={17} /></button>
    </div>
  </li>;
}

export default function PageOrderList({ pages, currentId, onSelect, onMove, onRemove, language }) {
  const [activeId, setActiveId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lastDrop = useRef('');
  const tr = (key, params) => translate(language, key, params);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const activeIndex = pages.findIndex(page => page.id === activeId);
  const activePage = pages[activeIndex];
  return <>
    <p className="page-order-hint">{tr('拖动左侧手柄调整顺序，也可使用右侧上下按钮。')}</p>
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[verticalOnly]}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      accessibility={{
        screenReaderInstructions: { draggable: tr('按空格键拾起页面，方向键调整位置，再按空格键放下，Esc 取消。') },
        announcements: {
          onDragStart: ({ active }) => tr('已拾起第 {n} 页。', { n: pages.findIndex(page => page.id === active.id) + 1 }),
          onDragOver: ({ over }) => over ? tr('目标位置：第 {n} 页。', { n: pages.findIndex(page => page.id === over.id) + 1 }) : undefined,
          onDragEnd: () => lastDrop.current,
          onDragCancel: () => tr('已取消排序，原顺序保留。'),
        },
      }}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        const from = pages.findIndex(page => page.id === active.id);
        const to = pages.findIndex(page => page.id === over?.id);
        if (from < 0 || to < 0) { lastDrop.current = tr('已取消排序，原顺序保留。'); return; }
        lastDrop.current = tr('已移至第 {n} 页。', { n: to + 1 });
        if (from !== to) onMove(from, to);
      }}>
      <SortableContext items={pages.map(page => page.id)} strategy={verticalListSortingStrategy}>
        <ol className="editor-page-list" aria-label={tr('页面顺序')}>
          {pages.map((page, index) => <SortablePage key={page.id} page={page} index={index} count={pages.length} selected={page.id === currentId}
            dragging={activeId !== null} reducedMotion={reducedMotion} onSelect={onSelect} onMove={onMove} onRemove={onRemove} tr={tr} />)}
        </ol>
      </SortableContext>
      {createPortal(<DragOverlay zIndex={1000} dropAnimation={reducedMotion ? null : { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
        {activePage ? <div className={`page-order-row page-order-overlay ${activeId === currentId ? 'page-order-selected' : ''}`} aria-hidden="true">
          <span className="page-order-handle"><GripVertical size={18} /></span>
          <span className="page-order-select">{activeIndex + 1}. {tr(PAGE_LABELS[activePage.type])}</span>
          <span className="page-order-overlay-label">{tr('拖动排序')}</span>
        </div> : null}
      </DragOverlay>, document.body)}
    </DndContext>
  </>;
}
