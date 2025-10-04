import { ApiProperty } from '@nestjs/swagger';
import { Achievement, Rule, LogicOperator } from '../../achievement.schema';

export class RuleResponse {
  @ApiProperty()
  category: string;
  @ApiProperty()
  field: string;
  @ApiProperty()
  value_type: string;
  @ApiProperty({ required: false })
  threshold?: number;
  @ApiProperty()
  operator: string;
  @ApiProperty()
  value: string;
}

export class AchievementResponse {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty({ required: false })
  icon_url?: string;
  @ApiProperty({ type: [RuleResponse] })
  rules: RuleResponse[];
  @ApiProperty({ enum: LogicOperator, default: LogicOperator.AND })
  logic_operator: LogicOperator;
  @ApiProperty({ required: false })
  reward?: string;

  constructor(ach: Achievement) {
    this._id = ach._id.toString();
    this.title = ach.title;
    this.description = ach.description;
    this.icon_url = ach.icon_url;
    this.rules = (ach.rules || []).map((r: Rule) => ({
      category: r.category,
      field: r.field,
      value_type: r.value_type,
      threshold: r.threshold,
      operator: r.operator,
      value: r.value,
    }));
    this.logic_operator = ach.logic_operator;
    this.reward = ach.reward;
  }
}