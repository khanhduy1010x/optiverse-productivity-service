import { Note } from '../../note.schema';

export class NoteResponse {
  note: Note;

  constructor(note: Note) {
    this.note = note;
  }
}
