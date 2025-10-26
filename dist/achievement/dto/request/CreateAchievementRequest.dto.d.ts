import { Operator, RuleCategory, ValueType, LogicOperator } from '../../achievement.schema';
export declare class RuleDto {
    category: RuleCategory;
    field: string;
    value_type: ValueType;
    threshold?: number;
    operator: Operator;
    value: string;
}
export declare class CreateAchievementRequest {
    title: string;
    description?: string;
    file?: any;
    icon_url?: string;
    rules: RuleDto[] | string;
    logic_operator?: LogicOperator;
    reward?: string;
}
