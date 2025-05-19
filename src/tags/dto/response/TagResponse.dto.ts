import { Tag } from '../../tag.schema';

export class TagResponse {
  tag: Tag;

  constructor(tag: Tag) {
    this.tag = tag;
  }
}
