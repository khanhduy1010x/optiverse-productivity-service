import { Operator, RuleCategory, ValueType, LogicOperator } from '../../achievement.schema';
export declare class RuleUpdateDto {
    category?: RuleCategory;
    field?: string;
    value_type?: ValueType;
    threshold?: number;
    operator?: Operator;
    value?: string;
}
export declare class UpdateAchievementRequest {
    file?: any;
    title?: string;
    description?: string;
    icon_url?: string;
    rules?: RuleUpdateDto[] | string;
    logic_operator?: LogicOperator;
    reward?: string;
}
