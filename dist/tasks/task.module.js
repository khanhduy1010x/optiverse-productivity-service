"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const task_schema_1 = require("./task.schema");
const task_controller_1 = require("./task.controller");
const task_service_1 = require("./task.service");
const task_repository_1 = require("./task.repository");
const task_tag_module_1 = require("../task-tags/task-tag.module");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema }]),
            task_tag_module_1.TaskTagModule,
        ],
        controllers: [task_controller_1.TaskController],
        providers: [task_service_1.TaskService, task_repository_1.TaskRepository],
        exports: [task_service_1.TaskService, task_repository_1.TaskRepository],
    })
], TasksModule);
//# sourceMappingURL=task.module.js.map