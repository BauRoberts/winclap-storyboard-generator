import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CommandItem {
  title: string;
  description: string;
  icon: string;
}

interface CommandsListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandsListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

const CommandsList = forwardRef<CommandsListRef, CommandsListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-md">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center space-x-2 rounded-sm px-2 py-1.5 text-left text-sm ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-xl">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </button>
        ))
      ) : (
        <div className="px-2 py-1.5 text-sm text-gray-500">No results</div>
      )}
    </div>
  );
});

CommandsList.displayName = 'CommandsList';

export default CommandsList;