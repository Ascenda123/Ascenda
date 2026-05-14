'use client';

import { useState } from 'react';
import { ApplicationPriorityBoard, type PriorityItem } from './application-priority-board';
import { HelpRequestModal, type HelpRequestModalApp } from './help-request-modal';

interface Props {
  items: PriorityItem[];
}

export function PriorityBoardWithHelp({ items }: Props) {
  const [helpApp, setHelpApp] = useState<HelpRequestModalApp | null>(null);

  return (
    <>
      <ApplicationPriorityBoard
        items={items}
        onRequestHelp={(item) =>
          setHelpApp({
            id: item.id,
            university: item.university,
            program: item.program,
            progress: typeof item.fitScore === 'number' ? Math.round(item.fitScore) : undefined,
            nextDeadline: item.nextDeadline,
            tasksRemaining: item.tasksRemaining
          })
        }
      />
      <HelpRequestModal
        open={helpApp !== null}
        onOpenChange={(open) => {
          if (!open) setHelpApp(null);
        }}
        app={helpApp}
      />
    </>
  );
}
