import { Achievement, LogicOperator } from '../../achievement.schema';
export declare class RuleResponse {
    category: string;
    field: string;
    value_type: string;
    threshold?: number;
    operator: string;
    value: string;
}
export declare class AchievementResponse {
    _id: string;
    title: string;
    description?: string;
    icon_url?: string;
    rules: RuleResponse[];
    logic_operator: LogicOperator;
    reward?: string;
    constructor(ach: Achievement);
}
