"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const share_schema_1 = require("./share.schema");
const share_controller_1 = require("./share.controller");
const share_service_1 = require("./share.service");
const share_repository_1 = require("./share.repository");
const note_module_1 = require("../notes/note.module");
const note_folder_module_1 = require("../note-folders/note-folder.module");
const axios_client_module_1 = require("../http-axios/axios-client.module");
let ShareModule = class ShareModule {
};
exports.ShareModule = ShareModule;
exports.ShareModule = ShareModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: share_schema_1.Share.name, schema: share_schema_1.ShareSchema }]),
            note_module_1.NoteModule,
            note_folder_module_1.NoteFolderModule,
            axios_client_module_1.AxiosClientModule,
        ],
        controllers: [share_controller_1.ShareController],
        providers: [share_service_1.ShareService, share_repository_1.ShareRepository],
        exports: [share_service_1.ShareService, share_repository_1.ShareRepository],
    })
], ShareModule);
//# sourceMappingURL=share.module.js.map