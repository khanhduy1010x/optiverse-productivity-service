"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteFolderModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const note_folder_schema_1 = require("./note-folder.schema");
const note_folder_controller_1 = require("./note-folder.controller");
const note_folder_service_1 = require("./note-folder.service");
const note_folder_repository_1 = require("./note-folder.repository");
const note_module_1 = require("../notes/note.module");
const share_repository_1 = require("../shares/share.repository");
const share_schema_1 = require("../shares/share.schema");
let NoteFolderModule = class NoteFolderModule {
};
exports.NoteFolderModule = NoteFolderModule;
exports.NoteFolderModule = NoteFolderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: note_folder_schema_1.NoteFolder.name, schema: note_folder_schema_1.NoteFolderSchema },
                { name: share_schema_1.Share.name, schema: share_schema_1.ShareSchema },
            ]),
            note_module_1.NoteModule,
        ],
        controllers: [note_folder_controller_1.NoteFolderController],
        providers: [note_folder_service_1.NoteFolderService, note_folder_repository_1.NoteFolderRepository, share_repository_1.ShareRepository],
        exports: [note_folder_service_1.NoteFolderService, note_folder_repository_1.NoteFolderRepository],
    })
], NoteFolderModule);
//# sourceMappingURL=note-folder.module.js.map