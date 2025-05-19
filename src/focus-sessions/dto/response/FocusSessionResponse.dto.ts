import { FocusSession } from '../../focus-session.schema';

export class FocusSessionResponse {
  focusSession: FocusSession;

  constructor(focusSession: FocusSession) {
    this.focusSession = focusSession;
  }
}
