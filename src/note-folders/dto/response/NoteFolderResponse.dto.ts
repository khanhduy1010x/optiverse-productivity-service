import { NoteFolder } from '../../note-folder.schema';

export class NoteFolderResponse {
  noteFolder: NoteFolder;

  constructor(noteFolder: NoteFolder) {
    this.noteFolder = noteFolder;
  }
}
