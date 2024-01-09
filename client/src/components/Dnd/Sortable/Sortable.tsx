import {
  Dispatch,
  ForwardRefExoticComponent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DndContext from "../Context";

interface SortableProps<P, I extends UniqueIdentifier> {
  items: I[];
  setItems: Dispatch<SetStateAction<I[]>>;
  Item: ForwardRefExoticComponent<P>;
  getItemProps: (item: I, index: number) => P;
  strategy?: SortStrategy;
}

type SortStrategy =
  | "rect-sorting"
  | "rect-swapping"
  | "horizontal"
  | "vertical";

const Sortable = <P, I extends UniqueIdentifier>({
  items,
  setItems,
  Item,
  getItemProps,
  strategy = "rect-sorting",
}: SortableProps<P, I>) => {
  const [activeItemProps, setActiveItemProps] = useState<P | null>(null);

  const handleDragStart = useCallback((ev: DragStartEvent) => {
    setActiveItemProps(ev.active.data.current as P | null);
  }, []);

  const handleDragEnd = useCallback(
    (ev: DragEndEvent) => {
      const { active, over } = ev;
      if (!over || active.id === over.id) return;

      setItems((items) => {
        const oldIndex = items.indexOf(active.id as I);
        const newIndex = items.indexOf(over.id as I);

        return arrayMove(items, oldIndex, newIndex);
      });

      setActiveItemProps(null);
    },
    [setItems]
  );

  return (
    <DndContext
      dragOverlay={{
        Element: activeItemProps && <Item isDragOverlay {...activeItemProps} />,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={getSortingStrategy(strategy)}>
        {items.map((item, i) => (
          <SortableItem
            key={item}
            id={item}
            Item={Item}
            {...getItemProps(item, i)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

interface SortableItemProps<P> {
  id: UniqueIdentifier;
  Item: ForwardRefExoticComponent<P>;
}

const SortableItem = <P,>(props: SortableItemProps<P> & P) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, data: props });

  return (
    <props.Item
      ref={setNodeRef}
      style={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: isDragging ? "grabbing" : "pointer",
      }}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
};

const getSortingStrategy = (strategy: SortStrategy) => {
  switch (strategy) {
    case "rect-sorting":
      return rectSortingStrategy;
    case "rect-swapping":
      return rectSwappingStrategy;
    case "horizontal":
      return horizontalListSortingStrategy;
    case "vertical":
      return verticalListSortingStrategy;
  }
};

export interface SortableItemProvidedProps {
  isDragging: boolean;
  isDragOverlay: boolean;
}

export default Sortable;
