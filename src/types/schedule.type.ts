import { ScheduleSlot, TutorActionState } from './tutor.type';
 
export type ScheduleActionResult = TutorActionState & {
  slots?: ScheduleSlot[];
};
 