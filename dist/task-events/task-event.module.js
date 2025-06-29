"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEventModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const task_event_schema_1 = require("./task-event.schema");
const task_event_controller_1 = require("./task-event.controller");
const task_event_service_1 = require("./task-event.service");
const task_event_repository_1 = require("./task-event.repository");
let TaskEventModule = class TaskEventModule {
};
exports.TaskEventModule = TaskEventModule;
exports.TaskEventModule = TaskEventModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: task_event_schema_1.TaskEvent.name, schema: task_event_schema_1.TaskEventSchema }])],
        controllers: [task_event_controller_1.TaskEventController],
        providers: [task_event_service_1.TaskEventService, task_event_repository_1.TaskEventRepository],
        exports: [task_event_service_1.TaskEventService],
    })
], TaskEventModule);
//# sourceMappingURL=task-event.module.js.map